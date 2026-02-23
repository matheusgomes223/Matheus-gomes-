import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Product } from '../services/db.service';

@Component({
   selector: 'app-inventory',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="flex flex-col relative max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">
      
      <!-- HEADER & CONTROLS -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-enter">
        <div>
           <h2 class="text-3xl font-bold text-dark tracking-tight">Inventário</h2>
           <p class="text-muted text-sm font-medium mt-1">Sistema de materiais.</p>
        </div>
        
        <div class="bg-white p-2 pr-4 rounded-full shadow-card flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
           
           <!-- Search Pill -->
           <div class="relative w-full md:w-80 group">
             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
             <input 
              type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Buscar item..." 
              class="block w-full pl-11 pr-4 py-2.5 bg-gray-50/50 rounded-full text-dark text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
             >
           </div>

           <!-- Filter Pills -->
           <div class="flex gap-1 bg-gray-100/50 p-1 rounded-full">
              <button (click)="activeCategory.set('TODOS')" 
                 class="px-5 py-2 rounded-full text-xs font-bold transition-all"
                 [class.bg-white]="activeCategory() === 'TODOS'"
                 [class.text-dark]="activeCategory() === 'TODOS'"
                 [class.shadow-sm]="activeCategory() === 'TODOS'"
                 [class.text-muted]="activeCategory() !== 'TODOS'">
                 Todos
              </button>
              <button (click)="activeCategory.set('EPI')" 
                 class="px-5 py-2 rounded-full text-xs font-bold transition-all"
                 [class.bg-white]="activeCategory() === 'EPI'"
                 [class.text-secondary]="activeCategory() === 'EPI'"
                 [class.shadow-sm]="activeCategory() === 'EPI'"
                 [class.text-muted]="activeCategory() !== 'EPI'">
                 EPIs
              </button>
              <button (click)="activeCategory.set('UNIFORME')" 
                 class="px-5 py-2 rounded-full text-xs font-bold transition-all"
                 [class.bg-white]="activeCategory() === 'UNIFORME'"
                 [class.text-primary]="activeCategory() === 'UNIFORME'"
                 [class.shadow-sm]="activeCategory() === 'UNIFORME'"
                 [class.text-muted]="activeCategory() !== 'UNIFORME'">
                 Uniformes
              </button>
           </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1">
        
        <!-- DESKTOP TABLE VIEW -->
        <div class="hidden md:block bg-white rounded-[2.5rem] shadow-card flex flex-col animate-enter" style="animation-delay: 100ms">
          <!-- Table Header (Added Gray Background for Contrast) -->
          <div class="grid grid-cols-12 gap-4 p-6 py-5 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
            <div class="col-span-5 text-xs font-bold text-muted uppercase tracking-wider pl-4">Item / Código</div>
            <div class="col-span-2 text-xs font-bold text-muted uppercase tracking-wider text-center">Categoria</div>
            <div class="col-span-2 text-xs font-bold text-muted uppercase tracking-wider text-center">Status</div>
            <div class="col-span-2 text-xs font-bold text-muted uppercase tracking-wider text-right">Saldo</div>
            <div class="col-span-1 text-xs font-bold text-muted uppercase tracking-wider text-right pr-4">Limites</div>
          </div>

          <!-- Table Body -->
          <div class="p-0">
            @for (item of filteredProducts(); track item.id) {
               <!-- Removed extra margin/padding, used border-b -->
               <div class="grid grid-cols-12 gap-4 items-center p-4 hover:bg-teal-50/20 transition-all border-b border-gray-50 last:border-0 group">
                  <!-- Product -->
                  <div class="col-span-5 flex items-center gap-4 pl-4">
                    <div class="w-10 h-10 rounded-xl bg-gray-50 text-[10px] font-bold text-gray-400 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {{ item.codigo.substring(0, 2) }}
                    </div>
                    <div>
                      <div class="font-bold text-dark text-sm group-hover:text-primary transition-colors leading-tight">{{ item.nome }}</div>
                      <div class="text-[11px] font-medium text-gray-400 mt-0.5">{{ item.codigo }}</div>
                    </div>
                  </div>

                  <!-- Category -->
                  <div class="col-span-2 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wide" 
                      [class.bg-teal-50]="item.categoria === 'UNIFORME'" 
                      [class.text-primary]="item.categoria === 'UNIFORME'"
                      [class.bg-yellow-50]="item.categoria === 'EPI'"
                      [class.text-yellow-700]="item.categoria === 'EPI'">
                      {{ item.categoria }}
                    </span>
                  </div>

                  <!-- Status -->
                  <div class="col-span-2 flex justify-center">
                       @if (item.estoque_atual === 0) {
                          <div class="px-3 py-1 rounded-full bg-red-50 text-danger text-[10px] font-bold flex items-center gap-1.5 border border-red-100">
                             <div class="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></div> CRÍTICO
                          </div>
                       } @else if (item.estoque_atual <= item.estoque_min) {
                          <div class="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold border border-yellow-100">BAIXO</div>
                       } @else {
                          <div class="px-3 py-1 rounded-full bg-green-50 text-primary text-[10px] font-bold border border-green-100">OK</div>
                       }
                  </div>

                  <!-- Saldo -->
                  <div class="col-span-2 text-right">
                    <span class="text-base font-bold text-dark">{{ item.estoque_atual }}</span> <span class="text-xs text-muted font-normal">un</span>
                  </div>

                  <!-- Min/Max -->
                  <div class="col-span-1 text-right pr-4">
                    <span class="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                       {{ item.estoque_min }}/{{ item.estoque_max }}
                    </span>
                  </div>
               </div>
            }
          </div>
        </div>

        <!-- MOBILE CARD VIEW -->
        <div class="md:hidden pb-24">
           <div class="grid grid-cols-1 gap-4">
             @for (item of filteredProducts(); track item.id; let i = $index) {
               <div class="bg-white rounded-[1.5rem] p-5 shadow-card animate-enter" [style.animation-delay]="(i * 30) + 'ms'">
                  <div class="flex justify-between items-start mb-3">
                     <div class="min-w-0 pr-2">
                        <h3 class="font-bold text-dark text-sm leading-tight">{{ item.nome }}</h3>
                        <p class="text-[11px] font-medium text-gray-400 mt-1">{{ item.codigo }}</p>
                     </div>
                     <span class="text-[9px] font-bold px-2 py-1 rounded-full uppercase shrink-0"
                        [class.bg-teal-50]="item.categoria === 'UNIFORME'" 
                        [class.text-primary]="item.categoria === 'UNIFORME'"
                        [class.bg-yellow-50]="item.categoria === 'EPI'"
                        [class.text-yellow-700]="item.categoria === 'EPI'">
                        {{ item.categoria.substring(0,3) }}
                     </span>
                  </div>

                  <div class="flex items-center justify-between mt-4 bg-gray-50 rounded-xl p-3">
                     <div>
                        <span class="text-[10px] text-muted uppercase font-bold block mb-0.5">Saldo</span>
                        <div class="text-xl font-bold"
                           [class.text-danger]="item.estoque_atual === 0"
                           [class.text-secondary]="item.estoque_atual > 0 && item.estoque_atual <= item.estoque_min"
                           [class.text-dark]="item.estoque_atual > item.estoque_min">
                           {{ item.estoque_atual }}
                        </div>
                     </div>
                     
                     <div class="text-right">
                        <span class="text-[10px] text-muted uppercase font-bold block mb-0.5">Min/Max</span>
                        <div class="text-sm font-medium text-dark">{{ item.estoque_min }} / {{ item.estoque_max }}</div>
                     </div>
                  </div>
               </div>
             }
           </div>
        </div>

        @if (filteredProducts().length === 0) {
           <div class="flex flex-col items-center justify-center py-20 opacity-50">
              <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <p class="text-muted font-medium">Nenhum produto encontrado.</p>
           </div>
        }
      </div>
    </div>
  `
})
export class InventoryComponent {
   db = inject(DbService);
   searchTerm = signal('');
   activeCategory = signal<'TODOS' | 'EPI' | 'UNIFORME'>('TODOS');

   filteredProducts = computed(() => {
      const search = this.searchTerm().toLowerCase();
      const cat = this.activeCategory();

      return this.db.products().filter(p => {
         const pNome = p.nome ? p.nome.toLowerCase() : '';
         const pCodigo = p.codigo ? p.codigo.toLowerCase() : '';
         const matchesSearch = pNome.includes(search) || pCodigo.includes(search);
         const matchesCat = cat === 'TODOS' || p.categoria === cat;
         return matchesSearch && matchesCat;
      });
   });
}