'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  XCircle, 
  Eye,
  Lock,
  Share2,
  Printer,
  Smartphone,
  Laptop,
  Wifi
} from 'lucide-react';
import { QRAccessToken } from '@/lib/types';
import Link from 'next/link';

interface QRDisplayProps {
  token: QRAccessToken;
  onRevoke?: (tokenId: string) => void;
  showRevokeButton?: boolean;
}

export function QRDisplay({ token, onRevoke, showRevokeButton = true }: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [urlMode, setUrlMode] = useState<'local' | 'network'>('local');
  const [networkIp, setNetworkIp] = useState<string>('10.133.124.26');
  const [isLocalhost, setIsLocalhost] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(prev => (prev !== isLocal ? isLocal : prev));
      
      // Fetch dynamic network IP
      fetch('/api/network-ip')
        .then(r => r.json())
        .then(d => {
          if (!ignore && d.ip) setNetworkIp(d.ip);
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, []);

  // Compute selected URL
  const localUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/emergency-access/${token.token_hash}`
    : `http://localhost:3000/emergency-access/${token.token_hash}`;

  const networkUrl = `http://${networkIp}:3000/emergency-access/${token.token_hash}`;

  const effectiveUrl = (urlMode === 'network' && isLocalhost) ? networkUrl : localUrl;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(effectiveUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#080C14',
        light: '#FFFFFF',
      },
    })
      .then(url => {
        if (isMounted) setDataUrl(url);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [effectiveUrl]);

  // Expiration countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expires = new Date(token.expires_at).getTime();
      const diff = expires - now;

      if (token.status === 'revoked') {
        setTimeLeft('REVOKED');
        return;
      }
      if (diff <= 0 || token.status === 'expired') {
        setTimeLeft('EXPIRED');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `carebridge-emergency-pass-${token.id.slice(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const isInvalid = token.status === 'expired' || token.status === 'revoked' || timeLeft === 'EXPIRED';

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all border border-white/[0.08]">
      {/* Delicate top gradient hairline */}
      <div className={`h-[2px] w-full absolute top-0 left-0 ${
        token.status === 'revoked' ? 'bg-red-500' :
        token.status === 'expired' ? 'bg-amber-500' :
        'bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400'
      }`} />

      {/* Target Device Destination Mode Selector (Addresses localhost camera scan issue) */}
      {isLocalhost && (
        <div className="mb-5 p-2 rounded-xl bg-[#090D1A] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-medium">QR Scanning Target:</span>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-black/40 border border-white/[0.05]">
            <button
              onClick={() => setUrlMode('local')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                urlMode === 'local' 
                  ? 'bg-sky-500 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3 h-3" />
              This PC (localhost)
            </button>
            <button
              onClick={() => setUrlMode('network')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                urlMode === 'network' 
                  ? 'bg-emerald-400 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Network IP: ${networkIp}:3000`}
            >
              <Smartphone className="w-3 h-3" />
              Phone Wi-Fi Pass ({networkIp})
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Pass-Style QR Badge Container */}
        <div className="relative shrink-0 p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
          {dataUrl ? (
            <img 
              src={dataUrl} 
              alt="CareBridge Emergency Health Pass QR" 
              className={`w-44 h-44 rounded-xl object-contain ${isInvalid ? 'opacity-20 blur-[1px]' : ''}`}
            />
          ) : (
            <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-slate-400">
              <QrCode className="w-12 h-12 animate-pulse" />
            </div>
          )}

          {/* Invalid Overlay */}
          {isInvalid && (
            <div className="absolute inset-0 bg-[#0A0E1A]/85 rounded-2xl flex flex-col items-center justify-center text-center p-3">
              <XCircle className="w-8 h-8 text-red-400 mb-1" />
              <span className="font-bold text-xs text-red-200 uppercase tracking-wider">
                {token.status === 'revoked' ? 'ACCESS REVOKED' : 'TOKEN EXPIRED'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Record bridge terminated</span>
            </div>
          )}
        </div>

        {/* QR Specifications & Metadata */}
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                PS-40 Emergency Pass
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                token.status === 'active' && timeLeft !== 'EXPIRED'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-300 border border-red-500/20'
              }`}>
                {token.status === 'active' && timeLeft !== 'EXPIRED' ? 'Active & Cryptographically Bound' : token.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Time-Limited Emergency Record Bridge
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Provides first responders with scoped access to triage injuries and emergency vitals. Does <strong className="text-slate-300">not</strong> expose full lifetime health records.
            </p>
          </div>

          {/* Metadata Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Valid Window</span>
              <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className={timeLeft === 'EXPIRED' || timeLeft === 'REVOKED' ? 'text-red-400 font-semibold' : 'text-slate-200'}>
                  {timeLeft || '24h active'}
                </span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Usage Limit</span>
              <span className="font-medium text-slate-200 mt-0.5 block font-mono">
                {token.use_count} of {token.max_uses} scans
              </span>
            </div>

            <div className="col-span-2 pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] text-slate-500 block uppercase font-medium mb-1">Authorized Data Scope</span>
              <div className="flex flex-wrap gap-1">
                {(token.permitted_scope || ['incident_summary', 'location', 'triage_status']).map((scope) => (
                  <span key={scope} className="text-[10px] bg-white/[0.04] text-slate-300 px-2 py-0.5 rounded border border-white/[0.06]">
                    {scope.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/[0.08]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Link Copied' : 'Copy Link'}
            </button>

            <button
              onClick={handleDownload}
              disabled={isInvalid || !dataUrl}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/[0.08]"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Download PNG
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/[0.08]"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print Pass
            </button>

            <Link
              href={`/emergency-access/${token.token_hash}`}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              Test Destination
            </Link>

            {showRevokeButton && token.status === 'active' && onRevoke && (
              <button
                onClick={() => {
                  if (confirm('Revoke this emergency QR token immediately? Any responder scanning this code will immediately be denied access.')) {
                    onRevoke(token.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-all border border-red-900/60 ml-auto"
              >
                <XCircle className="w-3.5 h-3.5" />
                Revoke Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
