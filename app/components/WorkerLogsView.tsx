import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ShieldAlert, Cpu, Layers } from 'lucide-react';
import type { WorkerLog } from '../types';

interface WorkerLogsViewProps {
  logs: WorkerLog[];
  onClearLogs: () => void;
}

export function WorkerLogsView({ logs, onClearLogs }: WorkerLogsViewProps) {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const services = ['all', 'catalog', 'cart', 'auth', 'order', 'payment', 'worker'];
  const types = ['all', 'info', 'success', 'warning', 'error'];

  const filteredLogs = logs.filter(log => {
    const serviceMatch = selectedService === 'all' || log.service === selectedService;
    const typeMatch = selectedType === 'all' || log.type === selectedType;
    return serviceMatch && typeMatch;
  });

  const getLogTypeStyles = (type: WorkerLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
      case 'warning':
        return 'text-amber-400 bg-amber-500/5 border-amber-500/10';
      case 'error':
        return 'text-red-400 bg-red-500/5 border-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/5 border-gray-500/10';
    }
  };

  const getServiceColor = (service: WorkerLog['service']) => {
    switch (service) {
      case 'catalog': return 'text-sky-400';
      case 'cart': return 'text-violet-400';
      case 'auth': return 'text-pink-400';
      case 'order': return 'text-orange-400';
      case 'payment': return 'text-indigo-400';
      case 'worker': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${date.toTimeString().split(' ')[0]}.${ms}`;
  };

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-gray-900 bg-gray-950 overflow-hidden shadow-2xl">
      {/* Log Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-900 bg-gray-900/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-mono">Microservices Orchestrator Logs</h3>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
            LIVE
          </span>
        </div>

        <button
          onClick={onClearLogs}
          className="flex items-center gap-1.5 rounded-lg border border-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-700 hover:text-white transition-colors"
          title="Clear all logs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Logs
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-4 border-b border-gray-900 bg-gray-900/20 px-5 py-2.5 text-xs">
        {/* Service filter */}
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-400 font-bold">Service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rounded border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-gray-300 focus:border-indigo-500 focus:outline-none"
          >
            {services.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-400 font-bold">Severity:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-gray-300 focus:border-indigo-500 focus:outline-none"
          >
            {types.map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Logs Output */}
      <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-relaxed space-y-2 bg-gray-950">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-center">
            <Cpu className="h-8 w-8 text-gray-800 mb-2 animate-pulse" />
            <p>No log traces matching selection filters.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-3 rounded border px-3 py-1.5 transition-all ${getLogTypeStyles(log.type)}`}
            >
              {/* Log timestamp */}
              <span className="text-gray-500 select-none">
                [{formatTimestamp(log.timestamp)}]
              </span>

              {/* Service tags */}
              <span className={`font-bold min-w-[70px] uppercase select-none ${getServiceColor(log.service)}`}>
                {log.service}
              </span>

              {/* Log Message */}
              <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
