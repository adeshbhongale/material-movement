import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, ShieldAlert, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notificationsFullList'],
    queryFn: async () => {
      const { data } = await api.get('/notifications?limit=50');
      return data.notifications || [];
    }
  });

  const readMutation = useMutation({
    mutationFn: async (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificationsFullList'] })
  });

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await readMutation.mutateAsync(n._id);
    }
    if (n.barcodeId) {
      navigate(`/barcodes/${n.barcodeId}`);
    } else if (n.transactionId) {
      navigate(`/transactions/${n.transactionId}`);
    } else if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Inbox of lifecycle updates, transfer notifications, and approvals</p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-slate-400 text-xs text-center py-8">Loading notifications...</p>
        ) : notifData?.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-8">No notifications received.</p>
        ) : (
          notifData?.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 border rounded-2xl flex justify-between items-start gap-4 transition cursor-pointer ${
                n.read 
                  ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800' 
                  : 'bg-white dark:bg-slate-900 border-primary/20 dark:border-primary/40 shadow-sm shadow-primary/5 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="space-y-1">
                <p className={`text-xs ${n.read ? 'font-semibold text-slate-700 dark:text-slate-300' : 'font-extrabold text-slate-800 dark:text-slate-100'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>

              {!n.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    readMutation.mutate(n._id);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-655"
                  title="Mark as Read"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
