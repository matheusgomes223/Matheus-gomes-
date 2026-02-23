import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Product, Order } from '../services/db.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col relative max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-8">
      
      <!-- VIEW: HISTORY LIST (Default) -->
      @if (!isCreatingOrder) {
        <!-- Toolbar & Date Filter -->
        <div class="flex flex-col md:flex-row justify-between items-end gap-6 animate-enter" style="animation-delay: 0ms">
          <div>
             <h2 class="text-3xl font-bold text-dark tracking-tight">Pedidos</h2>
             <p class="text-muted text-sm mt-1 font-medium">Gestão de remessas e conferências.</p>
          </div>
          
          <div class="flex items-center gap-4 w-full md:w-auto">
             <!-- Date Filter Pill -->
             <div class="bg-white flex items-center px-5 py-3 rounded-full shadow-card border-none focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <input type="date" [(ngModel)]="filterDate" class="bg-transparent border-none outline-none text-sm text-dark font-medium">
                <button *ngIf="filterDate" (click)="filterDate = ''" class="ml-2 text-muted hover:text-danger rounded-full p-1 hover:bg-gray-100">✕</button>
             </div>

             <!-- New Order Button -->
             <button (click)="startNewOrder()" class="bg-primary hover:bg-teal-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span class="hidden md:inline">Nova Remessa</span>
             </button>
          </div>
        </div>

        <!-- Orders Grid (Rounded Cards) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          @for (order of filteredOrders(); track order.id; let i = $index) {
            <div (click)="openReceive(order)" class="animate-enter bg-white rounded-[2rem] p-6 shadow-card flex flex-col justify-between relative overflow-hidden group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer h-64" [style.animation-delay]="(100 + i * 50) + 'ms'">
               
               <!-- Top Status Strip -->
               <div class="absolute top-0 left-8 right-8 h-1 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" [class.bg-primary]="order.status === 'RECEBIDO'" [class.bg-secondary]="order.status !== 'RECEBIDO'"></div>

               <!-- Header -->
               <div class="flex justify-between items-start mb-6 z-10">
                 <div>
                    <h3 class="text-2xl font-bold text-dark tracking-tight">{{ order.dataCriacao | date:'dd' }} <span class="text-sm text-muted font-medium">{{ order.dataCriacao | date:'MMM' }}</span></h3>
                    <p class="text-xs text-muted font-mono mt-1 opacity-60">#{{ order.numero }}</p>
                 </div>
                 
                 <span class="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
                   [class.bg-teal-50]="order.status === 'RECEBIDO'"
                   [class.text-primary]="order.status === 'RECEBIDO'"
                   [class.bg-yellow-50]="order.status !== 'RECEBIDO'"
                   [class.text-yellow-700]="order.status !== 'RECEBIDO'">
                   {{ order.status }}
                 </span>
               </div>

               <!-- Info -->
               <div class="space-y-3 z-10">
                  <div class="flex items-center gap-3 text-xs text-dark font-medium p-2 rounded-xl bg-gray-50/50">
                     <div class="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                     </div>
                     <span class="truncate">{{ order.fornecedor || 'Fornecedor Geral' }}</span>
                  </div>
               </div>

               <!-- Footer -->
               <div class="mt-auto flex justify-between items-end pt-4 z-10">
                  <span class="text-xs font-bold text-muted uppercase tracking-wider">{{ order.itens.length }} Itens</span>
                  <div class="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
               </div>

               <!-- Decorative Background Blob -->
               <div class="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors z-0"></div>

               @if (order.temDivergencia) {
                 <div class="absolute bottom-6 left-6 flex items-center gap-1.5 text-danger bg-white/80 backdrop-blur rounded-full px-2 py-1 shadow-sm border border-danger/10 z-20">
                    <div class="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                    <span class="text-[10px] font-bold">Atenção</span>
                 </div>
               }
            </div>
          }
          @if (filteredOrders().length === 0) {
            <div class="col-span-full py-20 text-center text-muted animate-enter opacity-60">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p class="text-sm font-medium">Nenhum pedido encontrado.</p>
            </div>
          }
        </div>
      }

      <!-- VIEW: PRODUCT SELECTOR (Creating Order) -->
      @if (isCreatingOrder) {
        <div class="fixed inset-0 bg-gray-100/50 backdrop-blur-sm z-50 flex flex-col animate-scale-in p-4 md:p-8">
          
          <div class="bg-white w-full max-w-5xl mx-auto h-full rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white">
            
            <!-- Header -->
            <div class="px-8 pt-8 pb-4 bg-white z-10 flex flex-col gap-6">
                <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-2xl font-bold text-dark">Nova Remessa</h2>
                    <p class="text-muted text-sm mt-1">Selecione produtos do catálogo.</p>
                </div>
                
                <button (click)="cancelNewOrder()" class="w-10 h-10 rounded-full bg-gray-50 text-dark hover:bg-gray-200 flex items-center justify-center transition-colors font-bold">✕</button>
                </div>

                <!-- FILTERS ROW -->
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="relative flex-1">
                        <input [ngModel]="selectorSearch()" (ngModelChange)="selectorSearch.set($event)" type="text" placeholder="Buscar produto..." class="w-full bg-gray-50 rounded-full py-3 pl-12 pr-6 text-sm text-dark placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner">
                        <svg class="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    @if (viewMode() === 'PENDING') {
                        <div class="relative animate-scale-in">
                            <input type="date" [(ngModel)]="selectorDate" class="bg-gray-50 rounded-full py-3 px-6 text-sm text-dark outline-none focus:ring-2 focus:ring-primary/20 h-full shadow-inner">
                        </div>
                    }
                </div>

                <!-- TABS -->
                <div class="flex items-center gap-2 mt-2 pb-1">
                    <button (click)="viewMode.set('CATALOG')" 
                        class="px-6 py-2.5 rounded-full text-xs font-bold transition-all relative whitespace-nowrap"
                        [class.bg-dark]="viewMode() === 'CATALOG'"
                        [class.text-white]="viewMode() === 'CATALOG'"
                        [class.bg-gray-100]="viewMode() !== 'CATALOG'"
                        [class.text-muted]="viewMode() !== 'CATALOG'">
                        Catálogo
                    </button>

                    <button (click)="viewMode.set('PENDING')" 
                        class="px-6 py-2.5 rounded-full text-xs font-bold transition-all relative flex items-center gap-2 whitespace-nowrap"
                        [class.bg-yellow-400]="viewMode() === 'PENDING'"
                        [class.text-dark]="viewMode() === 'PENDING'"
                        [class.bg-gray-100]="viewMode() !== 'PENDING'"
                        [class.text-muted]="viewMode() !== 'PENDING'">
                        Pendências
                        <span class="bg-white/30 text-dark text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{{ pendingItemsCount() }}</span>
                    </button>
                    
                    <button (click)="viewMode.set('SELECTED')" 
                        class="px-6 py-2.5 rounded-full text-xs font-bold transition-all relative flex items-center gap-2 whitespace-nowrap"
                        [class.bg-primary]="viewMode() === 'SELECTED'"
                        [class.text-white]="viewMode() === 'SELECTED'"
                        [class.bg-gray-100]="viewMode() !== 'SELECTED'"
                        [class.text-muted]="viewMode() !== 'SELECTED'">
                        Selecionados
                        <span class="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{{ getUniqueSelectedCount() }}</span>
                    </button>
                </div>
            </div>

            <!-- List Area -->
            <div class="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2 space-y-3 bg-white">
                
                <!-- PENDING ITEMS -->
                @if (viewMode() === 'PENDING') {
                @for (item of filteredPendingItems(); track item.uniqueKey) {
                    <div class="flex items-center justify-between bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div class="flex-1 min-w-0 pr-4">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="text-[10px] bg-yellow-50 text-secondary px-2 py-1 rounded-md uppercase font-bold tracking-wide">Falta</span>
                                <span class="text-[10px] text-muted font-medium">{{ item.originalDate | date:'dd/MM/yyyy' }}</span>
                            </div>
                            <h4 class="text-base font-bold text-dark truncate">{{ item.productName }}</h4>
                            <p class="text-xs text-muted mt-0.5">Origem: #{{ item.orderRef }}</p>
                        </div>

                        <div class="flex items-center gap-6">
                            <div class="text-right">
                                <p class="text-2xl font-bold text-secondary">{{ item.diff }}</p>
                            </div>
                            
                            <button (click)="addPendingToCart(item.productId, item.diff)" class="w-10 h-10 rounded-full bg-gray-50 hover:bg-secondary hover:text-white text-dark transition-colors flex items-center justify-center shadow-sm">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>
                    </div>
                }
                @if (filteredPendingItems().length === 0) {
                    <div class="flex flex-col items-center justify-center py-20 text-muted text-sm opacity-50">
                        <p>Sem pendências.</p>
                    </div>
                }
                }

                <!-- CATALOG & SELECTED -->
                @if (viewMode() !== 'PENDING') {
                    @for (prod of filteredProductsSelector(); track prod.id) {
                    <div class="flex items-center justify-between bg-gray-50 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all group animate-enter border border-transparent hover:border-gray-100">
                        
                        <div class="flex items-center gap-4 flex-1 min-w-0">
                            <!-- Action Button -->
                            <div class="shrink-0">
                            @if (tempItems[prod.id]) {
                                <div class="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
                                    <button (click)="decrement(prod.id)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-dark font-bold transition-colors">-</button>
                                    <input 
                                        type="number" 
                                        [ngModel]="tempItems[prod.id]" 
                                        (ngModelChange)="updateManualQty(prod.id, $event)"
                                        class="w-12 bg-transparent text-center text-primary font-bold text-lg outline-none"
                                    >
                                    <button (click)="increment(prod.id)" class="w-8 h-8 rounded-lg bg-primary text-white font-bold hover:bg-teal-700 transition-colors">+</button>
                                </div>
                            } @else {
                                <button (click)="increment(prod.id)" class="w-10 h-10 rounded-xl bg-white text-gray-400 border border-gray-200 hover:border-primary hover:text-primary hover:shadow-md flex items-center justify-center transition-all">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                </button>
                            }
                            </div>

                            <div class="min-w-0">
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{{ prod.codigo }}</p>
                                <h4 class="text-sm font-bold text-dark truncate">{{ prod.nome }}</h4>
                            </div>
                        </div>

                        <!-- Stock -->
                        <div class="shrink-0 pl-6 ml-2 flex flex-col items-end">
                            <span class="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">Est: {{ prod.estoque_atual }}</span>
                        </div>
                    </div>
                    }
                    
                    @if (viewMode() === 'SELECTED' && filteredProductsSelector().length === 0) {
                        <div class="py-20 text-center text-muted text-sm opacity-50">
                            <p>Nenhum item selecionado.</p>
                        </div>
                    }
                }
            </div>

            <!-- Bottom Summary -->
            <div class="p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <input [(ngModel)]="newOrderFornecedor" type="text" placeholder="Nome do Fornecedor (Opcional)" class="w-full md:w-80 bg-gray-50 rounded-xl px-5 py-3 text-sm text-dark outline-none focus:ring-2 focus:ring-primary/20 transition-all">

                <div class="flex items-center gap-6 w-full md:w-auto justify-end">
                    <div class="text-right">
                        <p class="text-[10px] text-muted uppercase font-bold tracking-widest">Total Geral</p>
                        <p class="text-2xl font-bold text-dark">{{ getTotalSelectedCount() }} <span class="text-sm font-normal text-muted">un</span></p>
                    </div>
                    <button (click)="saveOrder()" [disabled]="getTotalSelectedCount() === 0" class="bg-primary hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:shadow-none transition-all active:scale-95 w-full md:w-auto text-sm tracking-wide">
                    Salvar Remessa
                    </button>
                </div>
            </div>

          </div>
        </div>
      }

      <!-- RECEIVE MODAL (Details) - Clean White -->
      @if (activeOrder && !isCreatingOrder) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 backdrop-enter">
          <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col modal-enter overflow-hidden relative">
            
            <!-- Success Overlay -->
             @if (showSuccessAnimation) {
               <div class="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center animate-enter">
                  <div class="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 animate-scale-in">
                     <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 class="text-3xl font-bold text-dark mb-2">Conferido!</h3>
                  <p class="text-muted text-base">O estoque foi atualizado com sucesso.</p>
               </div>
             }

            <!-- Header -->
            <div class="p-8 border-b border-gray-100 bg-white flex flex-col gap-6">
              <div class="flex justify-between items-start">
                 <div>
                    <h3 class="text-2xl font-bold text-dark">Conferência #{{activeOrder.numero}}</h3>
                    <p class="text-sm text-muted mt-1 font-medium">{{ activeOrder.fornecedor || 'Fornecedor não informado' }}</p>
                 </div>
                 <button (click)="closeReceive()" class="w-10 h-10 rounded-full bg-gray-50 text-dark hover:bg-gray-200 flex items-center justify-center transition-colors font-bold">✕</button>
              </div>

              <!-- Controls -->
              <div class="flex gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                 <div class="flex-1 bg-white rounded-xl p-2 px-4 shadow-sm">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Conferente</label>
                    <input [(ngModel)]="conferenteName" type="text" class="w-full bg-transparent text-dark font-bold text-sm outline-none placeholder:font-normal" placeholder="Seu nome...">
                 </div>
                 <div class="flex-1 bg-white rounded-xl p-2 px-4 shadow-sm">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Data</label>
                    <input [(ngModel)]="receiveDate" type="date" class="w-full bg-transparent text-dark font-bold text-sm outline-none">
                 </div>
              </div>

              <!-- Tabs -->
              <div class="flex gap-2">
                 <button (click)="receiveFilter.set('ALL')" class="px-5 py-2 rounded-full text-xs font-bold transition-all" [class.bg-dark]="receiveFilter() === 'ALL'" [class.text-white]="receiveFilter() === 'ALL'" [class.bg-gray-100]="receiveFilter() !== 'ALL'" [class.text-muted]="receiveFilter() !== 'ALL'">Todos</button>
                 <button (click)="receiveFilter.set('RECEIVED')" class="px-5 py-2 rounded-full text-xs font-bold transition-all" [class.bg-primary]="receiveFilter() === 'RECEIVED'" [class.text-white]="receiveFilter() === 'RECEIVED'" [class.bg-gray-100]="receiveFilter() !== 'RECEIVED'" [class.text-muted]="receiveFilter() !== 'RECEIVED'">Recebidos</button>
                 <button (click)="receiveFilter.set('PENDING')" class="px-5 py-2 rounded-full text-xs font-bold transition-all" [class.bg-secondary]="receiveFilter() === 'PENDING'" [class.text-white]="receiveFilter() === 'PENDING'" [class.bg-gray-100]="receiveFilter() !== 'PENDING'" [class.text-muted]="receiveFilter() !== 'PENDING'">Pendentes</button>
              </div>
            </div>

            <!-- List -->
            <div class="p-8 pt-2 overflow-y-auto flex-1 space-y-3 custom-scrollbar bg-white">
               @for (item of filteredReceiveItems(); track item.produtoId) {
                  <div class="bg-gray-50 p-4 rounded-2xl flex items-center justify-between gap-6 transition-all"
                       [class.ring-2]="(item.quantidadeRecebida || 0) === item.quantidadeSolicitada && (item.quantidadeRecebida || 0) > 0"
                       [class.ring-primary]="(item.quantidadeRecebida || 0) === item.quantidadeSolicitada && (item.quantidadeRecebida || 0) > 0"
                       [class.ring-inset]="true"
                       [class.bg-white]="(item.quantidadeRecebida || 0) > 0">
                     
                     <div class="flex-1">
                        <div class="flex items-center gap-3 mb-1">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Solicitado: {{ item.quantidadeSolicitada }}</span>
                            @if ((item.quantidadeRecebida || 0) < item.quantidadeSolicitada) {
                                <span class="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    Falta: {{ item.quantidadeSolicitada - (item.quantidadeRecebida || 0) }}
                                </span>
                            }
                        </div>
                        <h4 class="text-sm font-bold text-dark">{{ getProductName(item.produtoId) }}</h4>
                     </div>

                     <div class="flex items-center gap-3">
                        <!-- Quick Actions -->
                        <button (click)="updateItemQuantity(item.produtoId, 0)" 
                                class="w-10 h-10 flex items-center justify-center bg-red-50 text-danger rounded-xl hover:bg-red-100 transition-colors"
                                title="Definir como Pendente (0)">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <button (click)="updateItemQuantity(item.produtoId, item.quantidadeSolicitada)" 
                                class="w-10 h-10 flex items-center justify-center bg-teal-50 text-primary rounded-xl hover:bg-teal-100 transition-colors"
                                title="Definir como Recebido (Total)">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>

                        <!-- Divider -->
                        <div class="w-px h-8 bg-gray-200 mx-1"></div>

                        <!-- Stepper -->
                        <div class="flex items-center gap-2 bg-white shadow-sm p-1 rounded-xl border border-gray-100">
                            <button (click)="updateItemQuantity(item.produtoId, Math.max(0, (item.quantidadeRecebida || 0) - 1))" class="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg text-dark hover:bg-gray-100 font-bold transition-colors">-</button>
                            
                            <input 
                                [value]="item.quantidadeRecebida || 0" 
                                (input)="updateItemQuantityFromInput(item.produtoId, $event)"
                                type="number" min="0" class="w-14 bg-transparent text-center font-bold text-dark text-xl outline-none appearance-none">
                            
                            <button (click)="updateItemQuantity(item.produtoId, (item.quantidadeRecebida || 0) + 1)" class="w-10 h-10 flex items-center justify-center bg-primary rounded-lg text-white hover:bg-teal-700 font-bold transition-colors shadow-md">+</button>
                        </div>
                     </div>
                  </div>
               }
            </div>

            <!-- Footer -->
             <div class="p-6 border-t border-gray-100 bg-white">
                <button (click)="confirmReceipt()" [disabled]="!conferenteName || !receiveDate" class="w-full bg-primary hover:bg-teal-700 text-white py-4 rounded-xl font-bold shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all flex justify-center items-center gap-2 tracking-wide">
                   <span>Confirmar Conferência</span>
                </button>
             </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrdersComponent {
  db = inject(DbService);
  Math = Math;

  // View State
  isCreatingOrder = false;
  activeOrder: Order | null = null;
  activeOrderItems = signal<any[]>([]); // Changed to Signal for reactivity
  showSuccessAnimation = false;

  // History Filter
  filterDate = '';

  // Selector State
  selectorSearch = signal('');
  selectorDate = '';
  viewMode = signal<'CATALOG' | 'SELECTED' | 'PENDING'>('CATALOG');
  tempItems: Record<string, number> = {};
  newOrderFornecedor = '';

  // Receive State
  conferenteName = '';
  receiveDate = '';
  receiveFilter = signal<'ALL' | 'RECEIVED' | 'PENDING'>('ALL');

  // COMPUTED: Orders for History View
  filteredOrders = computed(() => {
    let list = this.db.orders();
    if (this.filterDate) {
      list = list.filter(o => o.dataCriacao.startsWith(this.filterDate));
    }
    return list.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  });

  // COMPUTED: Filter for Conference Modal
  filteredReceiveItems = computed(() => {
    const items = this.activeOrderItems(); // Reads signal
    const filter = this.receiveFilter();

    if (filter === 'RECEIVED') {
      return items.filter(i => (i.quantidadeRecebida || 0) > 0);
    }
    if (filter === 'PENDING') {
      return items.filter(i => (i.quantidadeRecebida || 0) < i.quantidadeSolicitada);
    }
    return items;
  });

  countReceived = computed(() => this.activeOrderItems().filter(i => (i.quantidadeRecebida || 0) > 0).length);
  countPending = computed(() => this.activeOrderItems().filter(i => (i.quantidadeRecebida || 0) < i.quantidadeSolicitada).length);

  // COMPUTED: Pending Items from History (Unreceived items)
  pendingItems = computed(() => {
    const allOrders = this.db.orders();
    const pending: any[] = [];

    allOrders.forEach(order => {
      if (order.status !== 'RECEBIDO') return;

      order.itens.forEach(item => {
        const received = item.quantidadeRecebida || 0;
        if (received < item.quantidadeSolicitada) {
          const diff = item.quantidadeSolicitada - received;
          const prod = this.db.products().find(p => p.id === item.produtoId);
          if (prod && diff > 0) {
            pending.push({
              uniqueKey: order.id + '_' + item.produtoId,
              productId: item.produtoId,
              productName: prod.nome,
              diff: diff,
              originalDate: order.dataCriacao,
              orderRef: order.numero
            });
          }
        }
      });
    });

    return pending;
  });

  filteredPendingItems = computed(() => {
    let items = this.pendingItems();
    const s = this.selectorSearch().toLowerCase();
    const d = this.selectorDate;

    if (s) {
      items = items.filter(i => i.productName.toLowerCase().includes(s));
    }

    if (d) {
      items = items.filter(i => i.originalDate.startsWith(d));
    }

    return items;
  });

  pendingItemsCount = computed(() => this.pendingItems().length);

  filteredProductsSelector = computed(() => {
    const s = this.selectorSearch().toLowerCase();
    const mode = this.viewMode();
    const all = this.db.products();

    let list = all;

    if (mode === 'SELECTED') {
      list = list.filter(p => this.tempItems[p.id] && this.tempItems[p.id] > 0);
    }

    if (s) {
      list = list.filter(p => {
        const pNome = p.nome ? p.nome.toLowerCase() : '';
        const pCodigo = p.codigo ? p.codigo.toLowerCase() : '';
        return pNome.includes(s) || pCodigo.includes(s);
      });
    }

    return list;
  });

  // --- ACTIONS ---

  startNewOrder() {
    this.tempItems = {};
    this.newOrderFornecedor = '';
    this.selectorSearch.set('');
    this.selectorDate = '';
    this.viewMode.set('CATALOG');
    this.isCreatingOrder = true;
  }

  cancelNewOrder() {
    this.isCreatingOrder = false;
  }

  addPendingToCart(productId: string, qty: number) {
    if (!this.tempItems[productId]) this.tempItems[productId] = 0;
    this.tempItems[productId] += qty;
  }

  increment(id: string) {
    if (!this.tempItems[id]) this.tempItems[id] = 0;
    this.tempItems[id]++;
  }

  decrement(id: string) {
    if (this.tempItems[id] > 0) {
      this.tempItems[id]--;
      if (this.tempItems[id] === 0) delete this.tempItems[id];
    }
  }

  updateManualQty(id: string, val: any) {
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      delete this.tempItems[id];
    } else {
      this.tempItems[id] = num;
    }
  }

  getTotalSelectedCount() {
    return Object.values(this.tempItems).reduce((a, b) => a + b, 0);
  }

  getUniqueSelectedCount() {
    return Object.keys(this.tempItems).length;
  }

  saveOrder() {
    const items = Object.entries(this.tempItems).map(([id, qtd]) => ({
      produtoId: id,
      quantidadeSolicitada: qtd,
      quantidadeRecebida: 0
    }));

    if (items.length === 0) return;

    this.db.createOrder({
      fornecedor: this.newOrderFornecedor || 'Remessa Geral',
      itens: items
    });

    this.isCreatingOrder = false;
  }

  openReceive(order: Order) {
    this.activeOrder = order;

    // Deep copy into signal
    const items = JSON.parse(JSON.stringify(order.itens));
    if (order.status === 'PENDENTE') {
      items.forEach((i: any) => i.quantidadeRecebida = 0);
    }
    this.activeOrderItems.set(items);

    this.conferenteName = order.quemConferiu || '';

    if (order.dataRecebimento) {
      this.receiveDate = order.dataRecebimento.split('T')[0];
    } else {
      this.receiveDate = new Date().toISOString().split('T')[0];
    }
  }

  // Signal Update Helpers
  updateItemQuantity(productId: string, newQty: number) {
    this.activeOrderItems.update(items =>
      items.map(item => item.produtoId === productId ? { ...item, quantidadeRecebida: newQty } : item)
    );
  }

  updateItemQuantityFromInput(productId: string, event: any) {
    const val = parseInt(event.target.value) || 0;
    this.updateItemQuantity(productId, val);
  }

  closeReceive() {
    this.activeOrder = null;
    this.receiveFilter.set('ALL');
    this.showSuccessAnimation = false;
  }

  confirmReceipt() {
    if (!this.activeOrder) return;

    // Show success animation first
    this.showSuccessAnimation = true;

    // Delay actual save to show animation
    setTimeout(() => {
      this.db.receiveOrder(this.activeOrder!.id, this.activeOrderItems(), this.conferenteName);
      this.closeReceive();
    }, 1500);
  }

  getProductName(id: string) {
    return this.db.products().find(p => p.id === id)?.nome || 'Item Excluído';
  }
}