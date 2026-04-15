import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminParticipants() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [batchSort, setBatchSort] = useState<'asc' | 'desc' | null>('asc');
  const [roomDrafts, setRoomDrafts] = useState<Record<string, string>>({});

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
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['participants'] });
      const prev = queryClient.getQueryData<any[]>(['participants']) || [];
      queryClient.setQueryData(['participants'], prev.filter((p) => p.id !== id));
      return { prev };
    },
    onSuccess: () => toast.success('삭제되었습니다'),
    onError: (e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['participants'], ctx.prev);
      toast.error((e as Error).message);
    },
  });

  const updateField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string | number | null }) => {
      const { error } = await supabase.from('participants').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ['participants'] });
      const prev = queryClient.getQueryData<any[]>(['participants']) || [];
      queryClient.setQueryData(
        ['participants'],
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['participants'], ctx.prev);
      toast.error((e as Error).message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    create.mutate(new FormData(e.currentTarget));
  };

  const toggleBatchSort = () => {
    setBatchSort((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  };

  const filtered = participants
    ?.filter((p) => {
      if (batchFilter !== 'all' && String(p.batch) !== batchFilter) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.employee_id?.includes(s) ||
        p.department?.toLowerCase().includes(s) ||
        p.team?.toLowerCase().includes(s) ||
        p.phone?.includes(s)
      );
    })
    .sort((a, b) => {
      if (!batchSort) return 0;
      const av = a.batch ?? 0;
      const bv = b.batch ?? 0;
      if (av === bv) return a.name.localeCompare(b.name, 'ko');
      return batchSort === 'asc' ? av - bv : bv - av;
    });

  const stats = {
    total: participants?.length || 0,
    batch1: participants?.filter((p) => p.batch === 1).length || 0,
    batch2: participants?.filter((p) => p.batch === 2).length || 0,
    confirmed: participants?.filter((p) => p.status === 'confirmed').length || 0,
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

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">전체 대상자</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.batch1}</p><p className="text-xs text-muted-foreground">1차수</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{stats.batch2}</p><p className="text-xs text-muted-foreground">2차수</p></CardContent></Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이름, 부서, 팀, 핸드폰으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="md:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 차수</SelectItem>
            <SelectItem value="1">1차수</SelectItem>
            <SelectItem value="2">2차수</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                  <TableHead>
                    <button
                      type="button"
                      onClick={toggleBatchSort}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      차수
                      <ArrowUpDown className="h-3 w-3" />
                      {batchSort && <span className="text-xs text-muted-foreground">({batchSort === 'asc' ? '↑' : '↓'})</span>}
                    </button>
                  </TableHead>
                  <TableHead>방</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((p) => (
                  <TableRow key={p.id} className={p.status === 'cancelled' ? 'opacity-50' : ''}>
                    <TableCell className="text-xs text-muted-foreground">{p.employee_id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {p.name}
                        {p.category === '스탭' && (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">스탭</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{p.department}</div>
                      {p.team && <div className="text-muted-foreground">{p.team}</div>}
                    </TableCell>
                    <TableCell>{p.position}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{p.phone}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.batch ? `${p.batch}차수` : '-'}</TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-[110px]"
                        placeholder="방 입력"
                        value={roomDrafts[p.id] ?? p.room_assignment ?? ''}
                        onChange={(e) => setRoomDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        onBlur={(e) => {
                          const v = e.target.value;
                          if (v !== (p.room_assignment ?? '')) {
                            updateField.mutate({ id: p.id, field: 'room_assignment', value: v });
                          }
                          setRoomDrafts((prev) => {
                            const next = { ...prev };
                            delete next[p.id];
                            return next;
                          });
                        }}
                      />
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
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
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
