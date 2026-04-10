import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  pending: '대기',
  confirmed: '확정',
  cancelled: '취소',
};

export default function AdminParticipants() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: participants } = useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('participants').select('*').order('batch').order('name');
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from('participants').insert({
        name: formData.get('name') as string,
        department: formData.get('department') as string,
        position: formData.get('position') as string,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      toast.success('삭제되었습니다');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('participants').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    create.mutate(new FormData(e.currentTarget));
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
              <div className="space-y-2">
                <Label>이름 *</Label>
                <Input name="name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>부서</Label>
                  <Input name="department" />
                </div>
                <div className="space-y-2">
                  <Label>직급</Label>
                  <Input name="position" />
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>직급</TableHead>
                <TableHead>차수</TableHead>
                <TableHead>방</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.department}</TableCell>
                  <TableCell>{p.position}</TableCell>
                  <TableCell>{p.batch}차</TableCell>
                  <TableCell>{p.room_assignment}</TableCell>
                  <TableCell>
                    <Select value={p.status || 'pending'} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v })}>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!participants?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    등록된 대상자가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
