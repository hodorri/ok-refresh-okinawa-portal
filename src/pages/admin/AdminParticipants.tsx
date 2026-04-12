import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '대기', variant: 'secondary' },
  confirmed: { label: '확정', variant: 'default' },
  cancelled: { label: '취소', variant: 'destructive' },
};

const passportLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  '제출': { label: '제출', variant: 'default' },
  '미제출': { label: '미제출', variant: 'destructive' },
  '통화완료': { label: '통화완료', variant: 'secondary' },
};

export default function AdminParticipants() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: participants } = useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('participants').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (formData: FormData) => {
      const employeeId = (formData.get('employee_id') as string)?.trim();
      if (!employeeId) throw new Error('사번은 필수입니다');
      const { error } = await supabase.from('participants').insert({
        employee_id: employeeId,
        name: formData.get('name') as string,
        department: formData.get('department') as string,
        team: formData.get('team') as string,
        position: formData.get('position') as string,
        phone: formData.get('phone') as string,
        batch: parseInt(formData.get('batch') as string) || 1,
        room_assignment: formData.get('room') as string,
        passport_submitted: '미제출',
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      toast.success('대상자가 추가되었습니다');
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('participants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      toast.success('삭제되었습니다');
    },
  });

  const updateField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => {
      const { error } = await supabase.from('participants').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    create.mutate(new FormData(e.currentTarget));
  };

  const filtered = participants?.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.employee_id?.includes(s) ||
      p.department?.toLowerCase().includes(s) ||
      p.team?.toLowerCase().includes(s) ||
      p.phone?.includes(s)
    );
  });

  const stats = {
    total: participants?.length || 0,
    confirmed: participants?.filter((p) => p.status === 'confirmed').length || 0,
    cancelled: participants?.filter((p) => p.status === 'cancelled').length || 0,
    passportDone: participants?.filter((p) => p.passport_submitted === '제출').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">대상자 관리</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" />대상자 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>대상자 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름 *</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label>사번 *</Label>
                  <Input name="employee_id" required placeholder="고유사번" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>부서</Label>
                  <Input name="department" />
                </div>
                <div className="space-y-2">
                  <Label>팀</Label>
                  <Input name="team" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>직급</Label>
                  <Input name="position" />
                </div>
                <div className="space-y-2">
                  <Label>핸드폰</Label>
                  <Input name="phone" placeholder="010-0000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>차수</Label>
                  <Input name="batch" type="number" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label>방배정</Label>
                  <Input name="room" placeholder="101호" />
                </div>
              </div>
              <Button type="submit" className="w-full">추가</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">전체 대상자</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-xs text-muted-foreground">참석 확정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-muted-foreground">불참</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.passportDone}/{stats.total}</p>
            <p className="text-xs text-muted-foreground">여권 제출</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="이름, 부서, 팀, 핸드폰으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사번</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>부서/팀</TableHead>
                  <TableHead>직급</TableHead>
                  <TableHead>핸드폰</TableHead>
                  <TableHead>차수</TableHead>
                  <TableHead>방</TableHead>
                  <TableHead>여권</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((p) => (
                  <TableRow key={p.id} className={p.status === 'cancelled' ? 'opacity-50' : ''}>
                    <TableCell className="text-xs text-muted-foreground">{p.employee_id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{p.name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{p.department}</div>
                      {p.team && <div className="text-muted-foreground">{p.team}</div>}
                    </TableCell>
                    <TableCell>{p.position}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{p.phone}</TableCell>
                    <TableCell>
                      <Select
                        value={String(p.batch || 1)}
                        onValueChange={(v) => updateField.mutate({ id: p.id, field: 'batch', value: v })}
                      >
                        <SelectTrigger className="h-8 w-[65px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1차</SelectItem>
                          <SelectItem value="2">2차</SelectItem>
                          <SelectItem value="3">3차</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{p.room_assignment}</TableCell>
                    <TableCell>
                      <Select
                        value={p.passport_submitted || '미제출'}
                        onValueChange={(v) => updateField.mutate({ id: p.id, field: 'passport_submitted', value: v })}
                      >
                        <SelectTrigger className="h-8 w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="제출">제출</SelectItem>
                          <SelectItem value="미제출">미제출</SelectItem>
                          <SelectItem value="통화완료">통화완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={p.status || 'pending'}
                        onValueChange={(v) => updateField.mutate({ id: p.id, field: 'status', value: v })}
                      >
                        <SelectTrigger className="h-8 w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="confirmed">확정</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        if (window.confirm(`${p.name}님을 삭제하시겠습니까?`)) remove.mutate(p.id);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered?.length && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                      {search ? '검색 결과가 없습니다' : '등록된 대상자가 없습니다'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
