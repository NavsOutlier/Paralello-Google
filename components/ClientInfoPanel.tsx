import React from 'react';

interface ClientInfoPanelProps {
  onBack: () => void;
}

export const ClientInfoPanel: React.FC<ClientInfoPanelProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-neutral-border">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div 
              className="h-16 w-16 rounded-xl bg-center bg-cover border border-neutral-border shadow-sm shrink-0"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBN93jr6UsHqfAp09KJyitTb9GW3lnETsuHIpjdvWIHDKasyq0wFubOdomGu9cE8ACF076VbXKkVXmSU75vWkxRozmGyv9LoKcXqU9AzreZ9NTfncJO-CPyPOJya_xLwcullmFngsfy-XRuDN8RH4srTMZVpq6tbQdt50leIVG63HMRACB1iubbdNUPG9EzmsmNiQ89YY4IHma0xcZJIYYBNgu2MwG5quQJcE_P3Vdv7A4PyihE0ZPDOA62pREWqlk80Q-PFXMSVCI")' }}
            ></div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-text-main leading-tight">Acme Corp</h2>
              <span className="text-sm text-text-secondary">Cliente desde 2021</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-background-light text-text-secondary transition-colors"
              title="Voltar para Tasks"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* Priority & Status */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Prioridade</label>
            <div className="relative">
              <select className="w-full appearance-none bg-background-light border border-neutral-border text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 outline-none">
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </div>
              <div className="absolute inset-y-0 right-8 flex items-center px-2">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Status do Cliente</label>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary text-primary-dark font-medium text-sm transition-all hover:bg-primary/20">
                <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                Onboarding
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-background-light border border-transparent text-text-secondary hover:bg-gray-100 font-normal text-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                Feliz
              </button>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-background-light rounded-xl p-4 border border-neutral-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">payments</span>
              Orçamento Mensal
            </h3>
            <button className="text-xs text-primary hover:underline font-medium">Editar</button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-sm text-text-secondary">Meta Ads</span>
              </div>
              <span className="text-sm font-semibold text-text-main font-mono">R$ 5.000,00</span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-text-secondary">Google Ads</span>
              </div>
              <span className="text-sm font-semibold text-text-main font-mono">R$ 3.200,00</span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-black"></span>
                <span className="text-sm text-text-secondary">TikTok Ads</span>
              </div>
              <span className="text-sm font-semibold text-text-main font-mono">R$ 1.500,00</span>
            </div>
          </div>
        </div>

        {/* Meeting */}
        <div>
          <h3 className="text-sm font-bold text-text-main mb-3 px-1">Última Reunião</h3>
          <div className="flex items-center justify-between bg-white border border-neutral-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary-dark p-2 rounded-lg group-hover:bg-primary group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-xl">calendar_month</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">Review Mensal</p>
                <p className="text-xs text-text-secondary">12 Out, 2023 • 14:30</p>
              </div>
            </div>
            <a href="#" className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined">videocam</span>
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-sm font-bold text-text-main mb-3 px-1">Links Rápidos</h3>
          <div className="space-y-2">
            <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-background-light border border-transparent hover:border-neutral-border transition-all group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-blue-600 transition-colors">folder_open</span>
                <span className="text-sm text-text-main">Pasta Google Drive</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </a>
            
            <div className="p-3 rounded-lg border border-neutral-border bg-background-light/50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined text-green-600">chat</span>
                  <span className="text-sm font-medium text-text-main">Grupo WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value="https://chat.whatsapp.com/G82..." 
                      readOnly
                      className="w-full text-xs text-text-main bg-white border border-neutral-border rounded-md py-1.5 pl-2 pr-8 focus:ring-1 focus:ring-primary focus:border-primary placeholder-text-secondary/50 outline-none" 
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none material-symbols-outlined text-[14px]">link</span>
                  </div>
                  <button className="flex items-center justify-center h-[30px] w-[30px] rounded-md bg-primary text-black hover:bg-primary-dark transition-colors shadow-sm" title="Copiar">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};