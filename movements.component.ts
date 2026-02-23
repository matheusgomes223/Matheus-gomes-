import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Product } from '../services/db.service';

interface Alert {
  id: string;
  message: string;
  type: 'WARNING' | 'DANGER';
}

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full relative max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">
      
      <!-- Notifications (Floating) -->
      <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        @for (alert of alerts(); track alert.id) {
          <div class="pointer-events-auto bg-white shadow-xl rounded-2xl p-4 w-80 animate-slide-in-right flex items-start gap-4 border-l-4"
             [class.border-secondary]="alert.type === 'WARNING'"
             [class.border-danger]="alert.type === 'DANGER'">
            <div class="shrink-0 pt-0.5">
               @if (alert.type === 'DANGER') {
                 <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               } @else {
                 <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               }
            </div>
            <div>
              <p class="font-bold text-sm text-dark">{{ alert.type === 'DANGER' ? 'Crítico' : 'Atenção' }}</p>
              <p class="text-xs text-muted mt-0.5 leading-relaxed">{{ alert.message }}</p>
            </div>
          </div>
        }
      </div>
      
      <!-- Header & Search -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-enter">
         <div>
            <h2 class="text-3xl font-bold text-dark tracking-tight">Movimentações</h2>
            <p class="text-muted text-sm mt-1 font-medium">Controle de fluxo de estoque.</p>
         </div>

         <!-- Search Pill -->
         <div class="relative w-full md:w-96 group">
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Pesquisar para adicionar..." 
              class="w-full bg-white h-12 rounded-full pl-12 pr-6 shadow-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-dark transition-all placeholder:text-gray-400"
            >
            <svg class="w-5 h-5 text-gray-400 absolute left-5 top-3.5 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
         </div>
      </div>

      <!-- Content Container (Rounded Card) -->
      <div class="flex-1 bg-white rounded-[2.5rem] shadow-card overflow-hidden flex flex-col relative animate-enter" style="animation-delay: 100ms">
        
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-y-auto custom-scrollbar flex-1 pb-32">
          <table class="w-full text-left border-collapse">
            <thead class="bg-white sticky top-0 z-10">
              <tr class="border-b border-gray-100">
                <th class="p-6 w-16 text-center">
                  <div class="relative flex items-center justify-center">
                    <input type="checkbox" (change)="toggleAll($event)" class="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary cursor-pointer">
                  </div>
                </th>
                <th class="p-6 text-xs font-bold text-muted uppercase tracking-wider">Produto</th>
                <th class="p-6 text-xs font-bold text-muted uppercase tracking-wider text-right">Limites</th>
                <th class="p-6 text-xs font-bold text-muted uppercase tracking-wider text-center">Ações</th>
                <th class="p-6 text-xs font-bold text-muted uppercase tracking-wider text-right">Saldo</th>
                <th class="p-6 text-xs font-bold text-muted uppercase tracking-wider text-center w-40">Qtd Movimento</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (item of filteredProducts(); track item.id) {
                <tr class="hover:bg-gray-50/80 transition-colors group" [class.bg-teal-50/30]="isSelected(item.id)">
                  <td class="p-6 text-center">
                    <input type="checkbox" 
                      [checked]="selection.has(item.id)" 
                      (change)="toggleItem(item.id)"
                      class="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary cursor-pointer">
                  </td>
                  <td class="p-6">
                     <div class="font-bold text-dark text-sm">{{ item.nome }}</div>
                     <div class="text-[11px] text-gray-400 font-medium mt-1">{{ item.codigo }}</div>
                  </td>
                  
                  <td class="p-6 text-right text-xs text-muted font-medium">
                     @if (editingId() === item.id) {
                       <div class="flex gap-2 justify-end items-center bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                         <input type="number" [(ngModel)]="tempMin" class="w-10 text-center text-xs outline-none font-bold text-dark bg-transparent">
                         <span class="text-gray-300">/</span>
                         <input type="number" [(ngModel)]="tempMax" class="w-10 text-center text-xs outline-none font-bold text-dark bg-transparent">
                       </div>
                     } @else {
                       <span class="bg-gray-100 px-2 py-1 rounded-md">{{ item.estoque_min }} / {{ item.estoque_max }}</span>
                     }
                  </td>
                  
                  <td class="p-6 text-center">
                     @if (editingId() === item.id) {
                       <div class="flex gap-2 justify-center">
                         <button (click)="saveEdit(item)" class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></button>
                         <button (click)="cancelEdit()" class="w-8 h-8 rounded-full bg-gray-200 text-muted flex items-center justify-center hover:scale-110 transition-transform"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                       </div>
                     } @else {
                       <button (click)="startEdit(item)" class="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                       </button>
                     }
                  </td>

                  <td class="p-6 text-right">
                     <span class="font-bold text-sm px-3 py-1 rounded-full"
                       [class.bg-red-50]="item.estoque_atual <= item.estoque_min"
                       [class.text-danger]="item.estoque_atual <= item.estoque_min"
                       [class.bg-gray-100]="item.estoque_atual > item.estoque_min"
                       [class.text-dark]="item.estoque_atual > item.estoque_min">
                       {{ item.estoque_atual }}
                     </span>
                  </td>

                  <td class="p-6 text-center">
                     <div class="relative">
                       <input type="number" 
                         placeholder="0" 
                         [disabled]="!selection.has(item.id)"
                         (input)="updateQty(item.id, $event)"
                         [value]="quantities[item.id] || ''"
                         class="w-full bg-gray-50 rounded-xl px-4 py-2 text-center text-sm font-bold text-dark focus:bg-white focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all outline-none border-none">
                     </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile List View -->
        <div class="md:hidden space-y-4 p-4 pb-48 animate-enter" style="animation-delay: 150ms">
           @for (item of filteredProducts(); track item.id) {
              <div class="bg-gray-50 p-5 rounded-[1.5rem] border border-transparent transition-all" 
                   [class.border-primary]="isSelected(item.id)"
                   [class.bg-white]="isSelected(item.id)"
                   [class.shadow-lg]="isSelected(item.id)"
                   (click)="toggleItem(item.id)">
                
                <div class="flex items-start gap-4">
                    <div class="w-6 flex justify-center shrink-0 pt-1">
                        <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all"
                            [class.border-gray-300]="!isSelected(item.id)"
                            [class.border-primary]="isSelected(item.id)"
                            [class.bg-primary]="isSelected(item.id)">
                            @if (isSelected(item.id)) { <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg> }
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-dark text-sm truncate">{{ item.nome }}</h4>
                        <div class="flex items-center gap-2 mt-1.5 text-xs">
                            <span class="text-gray-400 font-medium">{{ item.codigo }}</span>
                            <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span [class.text-danger]="item.estoque_atual <= item.estoque_min" class="font-bold text-muted">Saldo: {{ item.estoque_atual }}</span>
                        </div>
                    </div>
                </div>

                @if (isSelected(item.id)) {
                   <div class="mt-4 animate-scale-in pl-10" (click)="$event.stopPropagation()">
                      <input type="number" 
                        placeholder="Quantidade"
                        autoFocus
                        (input)="updateQty(item.id, $event)"
                        [value]="quantities[item.id] || ''"
                        class="w-full bg-gray-100 rounded-xl py-3 text-center font-bold text-lg focus:ring-2 focus:ring-primary outline-none text-dark placeholder:text-gray-400">
                   </div>
                }
              </div>
           }
        </div>

        @if (filteredProducts().length === 0) {
           <div class="py-20 text-center text-muted text-sm flex flex-col items-center">
             <svg class="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             Nenhum produto encontrado.
           </div>
        }
      </div>

      <!-- Floating Action Dock -->
      <div class="absolute bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[800px] z-20">
        <div class="bg-dark/95 backdrop-blur-md shadow-2xl rounded-2xl p-2.5 flex flex-col md:flex-row gap-3 animate-fade-in-up border border-white/10 ring-1 ring-black/5">
           
           <!-- Switch (In/Out) -->
           <div class="bg-white/10 p-1 rounded-xl flex shrink-0 w-full md:w-auto">
              <button (click)="movementType = 'SAIDA'" 
                 class="flex-1 md:w-32 py-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                 [class.bg-secondary]="movementType === 'SAIDA'"
                 [class.text-dark]="movementType === 'SAIDA'"
                 [class.text-white]="movementType !== 'SAIDA'">
                 SAÍDA
              </button>
              <button (click)="movementType = 'ENTRADA'" 
                 class="flex-1 md:w-32 py-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                 [class.bg-primary]="movementType === 'ENTRADA'"
                 [class.text-white]="movementType === 'ENTRADA'"
                 [class.text-white]="movementType !== 'ENTRADA'">
                 ENTRADA
              </button>
           </div>

           <!-- Inputs -->
           <div class="flex flex-col md:flex-row gap-2 w-full">
              <input [(ngModel)]="motivo" type="text" placeholder="Centro de Custo / Motivo" class="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:bg-white/20 focus:border-white/30 outline-none transition-all">
              <input [(ngModel)]="observacao" type="text" placeholder="Obs." class="w-full md:w-48 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:bg-white/20 focus:border-white/30 outline-none transition-all">
           </div>

           <!-- Submit Button -->
           <button 
             (click)="submitMovements()"
             [disabled]="selection.size === 0"
             class="w-full md:w-auto bg-white hover:bg-gray-100 disabled:bg-white/10 disabled:text-white/20 text-dark font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0">
             <span class="text-xs uppercase tracking-widest">{{ selection.size }} Itens</span>
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
           </button>
        </div>
      </div>

    </div>
  `
})
export class MovementsComponent {
  db = inject(DbService);

  searchTerm = signal('');
  movementType: 'ENTRADA' | 'SAIDA' = 'SAIDA';

  selection = new Set<string>();
  quantities: Record<string, number> = {};

  editingId = signal<string | null>(null);
  tempMin = 0;
  tempMax = 0;

  alerts = signal<Alert[]>([]);

  motivo = '';
  observacao = '';

  filteredProducts = computed(() => {
    const s = this.searchTerm().toLowerCase();
    return this.db.products()
      .filter(p => {
        const pNome = p.nome ? p.nome.toLowerCase() : '';
        const pCodigo = p.codigo ? p.codigo.toLowerCase() : '';
        return pCodigo.includes(s) || pNome.includes(s);
      }).slice(0, 50);
  });

  startEdit(item: Product) {
    this.editingId.set(item.id);
    this.tempMin = item.estoque_min;
    this.tempMax = item.estoque_max;
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(item: Product) {
    this.db.updateProduct(item.id, {
      estoque_min: this.tempMin,
      estoque_max: this.tempMax
    });
    this.editingId.set(null);
    this.pushAlert({ id: Date.now().toString(), message: `Limites atualizados para ${item.codigo}.`, type: 'WARNING' });
  }

  toggleItem(id: string) {
    if (this.selection.has(id)) {
      this.selection.delete(id);
      delete this.quantities[id];
    } else {
      this.selection.add(id);
      if (!this.quantities[id]) this.quantities[id] = 1;
    }
  }

  toggleAll(e: any) {
    const checked = e.target.checked;
    if (checked) {
      this.filteredProducts().forEach(p => {
        this.selection.add(p.id);
        if (!this.quantities[p.id]) this.quantities[p.id] = 1;
      });
    } else {
      this.selection.clear();
      this.quantities = {};
    }
  }

  updateQty(id: string, e: any) {
    const val = parseInt(e.target.value);
    if (val > 0) {
      this.quantities[id] = val;
    }
  }

  isSelected(id: string) {
    return this.selection.has(id);
  }

  pushAlert(alert: Alert) {
    this.alerts.update(old => [...old, alert]);
    setTimeout(() => {
      this.alerts.update(old => old.filter(a => a.id !== alert.id));
    }, 5000);
  }

  submitMovements() {
    if (this.selection.size === 0) return;

    const selectedIds = Array.from(this.selection);
    let successCount = 0;
    const products = this.db.products();

    selectedIds.forEach(id => {
      const qty = this.quantities[id] || 0;
      if (qty > 0) {
        this.db.addMovement({
          tipo: this.movementType,
          produtoId: id,
          quantidade: qty,
          atendente: 'Admin',
          centroCusto: this.motivo || 'Geral',
          observacao: this.observacao
        });
        successCount++;

        if (this.movementType === 'SAIDA') {
          const p = products.find(prod => prod.id === id);
          if (p) {
            const newStock = p.estoque_atual - qty;
            if (newStock <= p.estoque_min) {
              this.pushAlert({
                id: crypto.randomUUID(),
                type: 'DANGER',
                message: `ALERTA: ${p.nome} atingiu o mínimo (${p.estoque_min})!`
              });
            } else if (newStock <= p.estoque_min * 1.1) {
              this.pushAlert({
                id: crypto.randomUUID(),
                type: 'WARNING',
                message: `ATENÇÃO: ${p.nome} está próximo do fim.`
              });
            }
          }
        }
      }
    });

    if (successCount > 0 && this.alerts().length === 0) {
      alert(`${successCount} itens movimentados com sucesso!`);
    }

    this.selection.clear();
    this.quantities = {};
    this.motivo = '';
    this.observacao = '';
  }
}