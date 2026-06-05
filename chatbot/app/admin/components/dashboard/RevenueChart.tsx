"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';

export default function RevenueChart({ orders }: { orders: any[] }) {
  const chartData = React.useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
        fullDate: d.toISOString().split('T')[0],
        revenue: 0,
        orders: 0
      };
    });

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      const dayData = last30Days.find(d => d.fullDate === orderDate);
      if (dayData) {
        dayData.revenue += Number(o.totalAmount || 0);
        dayData.orders += 1;
      }
    });

    return last30Days;
  }, [orders]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;

  return (
    <div className="w-full mt-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">30 хоногийн орлого</p>
          <p className="text-xl font-black text-white mt-1">{totalRevenue.toLocaleString()}₮</p>
        </div>
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Нийт захиалга</p>
          <p className="text-xl font-black text-white mt-1">{totalOrders} ш</p>
        </div>
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Дундаж дүн (AOV)</p>
          <p className="text-xl font-black text-[#C5A059] mt-1">{Number(avgOrderValue).toLocaleString()}₮</p>
        </div>
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Идэвхтэй мөчлөг</p>
          <p className="text-xl font-black text-emerald-500 mt-1">30 Days</p>
        </div>
      </div>

      <div className="h-100 w-full bg-black/20 p-6 rounded-[2.5rem] border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase text-xs tracking-[0.3em]">Борлуулалтын дэлгэрэнгүй график</h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <div className="w-2 h-2 rounded-full bg-[#C5A059]" /> Орлого
             </div>
             <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <div className="w-2 h-2 rounded-full bg-white/20" /> Захиалгын тоо
             </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="date" 
              stroke="#555" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              interval="preserveStartEnd"
              minTickGap={20} 
            />
            <YAxis 
              stroke="#555" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0D0D0D', 
                border: '1px solid #ffffff10', 
                borderRadius: '20px', 
                color: '#fff',
                padding: '15px'
              }}
              cursor={{ stroke: '#C5A059', strokeWidth: 1, strokeDasharray: '5 5' }}
              formatter={(value: any, name?: any) => {
                if (name === "revenue") return [`${Number(value).toLocaleString()}₮`, "Нийт Орлого"];
                if (name === "orders") return [`${value} ш`, "Захиалга"];
                return [value, name];
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#C5A059" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
            <Area type="monotone" dataKey="orders" stroke="transparent" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}