import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-12 max-w-6xl mx-auto px-4 py-12">
      
      <!-- Hero Header -->
      <div class="text-center">
         <h2 class="text-4xl font-extrabold text-dark tracking-tight mb-3 animate-fade-in-up opacity-0" style="animation-delay: 0ms">Relatórios Corporativos</h2>
         <p class="text-muted font-medium text-lg max-w-xl mx-auto animate-fade-in-up opacity-0" style="animation-delay: 100ms">Exportação instantânea de dados para auditoria e controle.</p>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Products Export -->
        <button (click)="exportCSV('products')" class="group relative bg-white p-10 rounded-[2.5rem] shadow-card border border-transparent hover:border-primary/20 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden animate-fade-in-up opacity-0" style="animation-delay: 200ms">
            <!-- Decorative BG -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>

            <div class="relative z-10">
                <div class="w-16 h-16 rounded-3xl bg-teal-50 text-primary flex items-center justify-center mb-8 border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-dark mb-2">Inventário</h3>
                <p class="text-sm text-muted leading-relaxed">Relatório completo do saldo atual, incluindo mínimos, máximos e categorias.</p>
                
                <div class="mt-8 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span>Gerar CSV</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>
        </button>

        <!-- Movements Export -->
        <button (click)="exportCSV('movements')" class="group relative bg-white p-10 rounded-[2.5rem] shadow-card border border-transparent hover:border-secondary/20 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden animate-fade-in-up opacity-0" style="animation-delay: 300ms">
            <!-- Decorative BG -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div class="relative z-10">
                <div class="w-16 h-16 rounded-3xl bg-yellow-50 text-secondary flex items-center justify-center mb-8 border border-secondary/10 shadow-sm group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-dark mb-2">Movimentações</h3>
                <p class="text-sm text-muted leading-relaxed">Rastreabilidade total. Histórico de entradas, saídas, datas e responsáveis.</p>
                
                <div class="mt-8 flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span>Gerar CSV</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>
        </button>
        
        <!-- Orders Export -->
        <button (click)="exportCSV('orders')" class="group relative bg-white p-10 rounded-[2.5rem] shadow-card border border-transparent hover:border-dark/10 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden animate-fade-in-up opacity-0" style="animation-delay: 400ms">
             <!-- Decorative BG -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>

             <div class="relative z-10">
                <div class="w-16 h-16 rounded-3xl bg-gray-50 text-dark flex items-center justify-center mb-8 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-dark mb-2">Pedidos</h3>
                <p class="text-sm text-muted leading-relaxed">Relatório de remessas, conferências de entrada e divergências.</p>
                
                <div class="mt-8 flex items-center gap-2 text-dark font-bold text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Gerar CSV</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
             </div>
         </button>
      </div>

      <!-- Info Footer -->
      <div class="flex justify-center animate-fade-in-up opacity-0" style="animation-delay: 500ms">
         <div class="inline-flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-full text-xs font-bold text-muted border border-gray-100 shadow-inner">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            Exportação compatível com Excel e Google Sheets (.csv)
         </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
  db = inject(DbService);

  exportCSV(type: 'products' | 'movements' | 'orders') {
    let data: any[] = [];
    let filename = '';

    if (type === 'products') {
      data = this.db.products();
      filename = 'epi_estoque.csv';
    } else if (type === 'movements') {
      data = this.db.movements();
      filename = 'epi_movimentacoes.csv';
    } else {
      data = this.db.orders();
      filename = 'epi_pedidos.csv';
    }

    if (!data.length) {
      alert('Sem dados para exportar.');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => {
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') {
          const str = JSON.stringify(val).replace(/"/g, '""');
          return `"${str}"`;
        }
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}