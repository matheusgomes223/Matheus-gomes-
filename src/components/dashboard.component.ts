import { Component, inject, ElementRef, viewChild, AfterViewInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../services/db.service';
import { FormsModule } from '@angular/forms';

declare const d3: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-[1600px] mx-auto space-y-8 pb-12 pt-4">
      
      <!-- HEADER SECTION -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 animate-enter">
         <!-- Greeting -->
         <div class="flex items-center gap-4 w-full md:w-auto">
            <div class="w-14 h-14 rounded-full bg-sidebar text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
              AD
            </div>
            <div>
               <h1 class="text-2xl font-bold text-dark tracking-tight">Olá, Administrador</h1>
               <p class="text-sm text-muted">Visão geral do sistema de EPIs.</p>
            </div>
         </div>

         <!-- Search (Floating Pill with darker shadow for contrast) -->
         <div class="relative w-full md:w-96">
            <input type="text" placeholder="Buscar no dashboard..." class="w-full h-12 pl-12 pr-4 rounded-full bg-white shadow-card border border-transparent focus:border-primary/20 outline-none text-sm text-dark focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-gray-400">
            <svg class="w-5 h-5 text-gray-400 absolute left-5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
         </div>
      </div>

      <!-- ROW 1: 4 KPI CARDS (Tinted Gradients to break white monotony) -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <!-- Total Entradas (Teal Tint) -->
        <div class="bg-gradient-to-br from-white to-teal-50/50 rounded-[2rem] p-6 shadow-card border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 animate-enter" style="animation-delay: 100ms">
           <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
           </div>
           <div>
              <p class="text-xs text-muted font-bold uppercase tracking-wider mb-1">Entradas</p>
              <h3 class="text-3xl font-extrabold text-dark">{{ kpi().totalIn }}</h3>
              <p class="text-[10px] text-primary font-bold bg-white px-2 py-0.5 rounded-full inline-block mt-1 shadow-sm">+ Hoje</p>
           </div>
        </div>

        <!-- Total Saídas (Gold Tint) -->
        <div class="bg-gradient-to-br from-white to-yellow-50/50 rounded-[2rem] p-6 shadow-card border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 animate-enter" style="animation-delay: 200ms">
           <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
           </div>
           <div>
              <p class="text-xs text-muted font-bold uppercase tracking-wider mb-1">Saídas</p>
              <h3 class="text-3xl font-extrabold text-dark">{{ kpi().totalOut }}</h3>
              <p class="text-[10px] text-secondary font-bold bg-white px-2 py-0.5 rounded-full inline-block mt-1 shadow-sm">- Hoje</p>
           </div>
        </div>

        <!-- Em Estoque (Gray Tint) -->
        <div class="bg-gradient-to-br from-white to-gray-100/50 rounded-[2rem] p-6 shadow-card border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 animate-enter" style="animation-delay: 300ms">
           <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-dark shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
           </div>
           <div>
              <p class="text-xs text-muted font-bold uppercase tracking-wider mb-1">Positivos</p>
              <h3 class="text-3xl font-extrabold text-dark">{{ kpi().positiveStock }}</h3>
              <p class="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded-full inline-block mt-1 shadow-sm">Itens</p>
           </div>
        </div>

        <!-- Alertas (Red Tint) -->
        <div class="bg-gradient-to-br from-white to-red-50/50 rounded-[2rem] p-6 shadow-card border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 animate-enter" style="animation-delay: 400ms">
           <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-danger shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
           </div>
           <div>
              <p class="text-xs text-muted font-bold uppercase tracking-wider mb-1">Alertas</p>
              <h3 class="text-3xl font-extrabold text-dark">{{ kpi().zeroStock }}</h3>
              <p class="text-[10px] text-danger font-bold bg-white px-2 py-0.5 rounded-full inline-block mt-1 shadow-sm">Zerados</p>
           </div>
        </div>
      </div>

      <!-- ROW 2: Charts Area -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Left: Bar Chart (White Card with Gray Header) -->
        <div class="xl:col-span-2 bg-white rounded-[2.5rem] shadow-card flex flex-col h-[400px] animate-enter overflow-hidden" style="animation-delay: 500ms">
           <div class="flex justify-between items-center p-8 pb-4 bg-gray-50/50 border-b border-gray-100">
              <div>
                <h3 class="text-xl font-bold text-dark">Movimentação Semanal</h3>
                <p class="text-xs text-muted mt-1">Comparativo de fluxo nos últimos 7 dias</p>
              </div>
              
              <div class="flex items-center gap-4">
                 <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span class="text-xs font-bold text-dark">Entrada</span>
                 </div>
                 <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span class="text-xs font-bold text-dark">Saída</span>
                 </div>
              </div>
           </div>
           
           <div #chartContainer class="flex-1 w-full p-4 pt-2"></div>
        </div>

        <!-- Right: Donut Chart (DARK CARD for High Contrast) -->
        <div class="bg-sidebar rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-[400px] animate-enter relative overflow-hidden" style="animation-delay: 600ms">
           <!-- Decorative blob -->
           <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

           <h3 class="text-xl font-bold text-white mb-2 relative z-10">Saúde do Estoque</h3>
           <p class="text-xs text-gray-400 relative z-10 mb-4">Porcentagem de itens abastecidos.</p>
           
           <div class="flex-1 flex items-center justify-center relative z-10">
              <div #donutContainer class="flex items-center justify-center"></div>
              
              <!-- Center Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span class="text-5xl font-extrabold text-white tracking-tighter drop-shadow-lg">{{ kpi().healthScore }}%</span>
              </div>
           </div>

           <div class="flex justify-center gap-8 mt-4 relative z-10">
              <div class="text-center">
                 <span class="block w-2 h-2 rounded-full bg-primary mx-auto mb-1 ring-2 ring-primary/30"></span>
                 <p class="text-[10px] text-gray-300 font-bold">Abastecido</p>
              </div>
              <div class="text-center">
                 <span class="block w-2 h-2 rounded-full bg-gray-600 mx-auto mb-1"></span>
                 <p class="text-[10px] text-gray-500 font-bold">Vazio/Crítico</p>
              </div>
           </div>
        </div>
      </div>

      <!-- ROW 3: Bottom Lists -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-8">
        
        <!-- Left: Purchase Actions (Structured Table) -->
        <div class="xl:col-span-2 bg-white rounded-[2.5rem] shadow-card animate-enter overflow-hidden flex flex-col h-[500px]" style="animation-delay: 700ms">
           <div class="flex justify-between items-center p-8 pb-6 border-b border-gray-100 shrink-0">
              <h3 class="text-xl font-bold text-dark">Ação de Compra</h3>
              <button class="w-10 h-10 rounded-full bg-gray-50 text-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </button>
           </div>

           <div class="overflow-auto flex-1 p-0 custom-scrollbar">
              <table class="w-full text-left border-collapse">
                 <thead>
                    <tr class="text-[11px] text-muted font-bold uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                       <th class="py-4 pl-8">Produto</th>
                       <th class="py-4">Responsável</th>
                       <th class="py-4">Nível de Estoque</th>
                       <th class="py-4 text-right pr-8">Status</th>
                    </tr>
                 </thead>
                 <tbody class="text-sm">
                    @for (item of kpi().purchaseActionList; track item.id) {
                       <tr class="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                          <td class="py-4 pl-8 font-bold text-dark">
                             {{ item.nome }}
                             <span class="block text-[10px] font-normal text-gray-400 mt-0.5">{{ item.codigo }}</span>
                          </td>
                          <td class="py-4 text-muted">Gestor de Área</td>
                          <td class="py-4">
                             <div class="flex items-center gap-3">
                                <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                   <div class="h-full bg-secondary rounded-full" [style.width.%]="(item.estoque_atual / item.estoque_max) * 100"></div>
                                </div>
                                <span class="text-xs font-bold text-dark">{{ item.estoque_atual }}</span>
                             </div>
                          </td>
                          <td class="py-4 text-right pr-8">
                             <span class="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold bg-yellow-50 text-secondary border border-yellow-100/50">
                                <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> COMPRAR
                             </span>
                          </td>
                       </tr>
                    }
                    @if (kpi().purchaseActionList.length === 0) {
                       <tr>
                          <td colspan="4" class="py-12 text-center text-muted text-sm">
                             <svg class="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Nenhum item com estoque baixo.
                          </td>
                       </tr>
                    }
                 </tbody>
              </table>
           </div>
        </div>

        <!-- Right: Critical Items (Colored Cards) -->
        <div class="bg-white rounded-[2.5rem] p-8 shadow-card flex flex-col animate-enter border-t-4 border-danger/80 h-[500px]" style="animation-delay: 800ms">
            <!-- Mock Calendar Strip -->
            <div class="flex justify-between items-center mb-8 bg-gray-50 p-3 rounded-2xl shrink-0">
               <div class="text-center opacity-40"><span class="block text-[10px] font-bold text-muted">SEG</span><span class="block text-xs font-bold text-dark">03</span></div>
               <div class="text-center opacity-40"><span class="block text-[10px] font-bold text-muted">TER</span><span class="block text-xs font-bold text-dark">04</span></div>
               <div class="bg-white text-dark rounded-xl px-3 py-2 text-center shadow-md border border-gray-100 transform scale-105"><span class="block text-[9px] font-bold text-primary">HOJE</span><span class="block text-sm font-bold">{{ today.getDate() }}</span></div>
               <div class="text-center opacity-40"><span class="block text-[10px] font-bold text-muted">QUI</span><span class="block text-xs font-bold text-dark">{{ today.getDate() + 1 }}</span></div>
               <div class="text-center opacity-40"><span class="block text-[10px] font-bold text-muted">SEX</span><span class="block text-xs font-bold text-dark">{{ today.getDate() + 2 }}</span></div>
            </div>

            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-dark">Itens Críticos</h3>
                <span class="bg-red-50 text-danger text-[10px] font-bold px-2 py-1 rounded-md">{{ kpi().zeroStock }} Zerados</span>
            </div>
            
            <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
               @for (item of kpi().zeroStockList; track item.id) {
                  <!-- Card Style: White with Red Accent Border -->
                  <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                     <div class="absolute left-0 top-0 bottom-0 w-1 bg-danger"></div>
                     <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-red-50 text-danger flex items-center justify-center shrink-0">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div>
                           <h4 class="font-bold text-dark text-sm leading-tight group-hover:text-danger transition-colors">{{ item.nome }}</h4>
                           <p class="text-[10px] text-muted mt-1 font-medium">Cód: {{ item.codigo }}</p>
                        </div>
                     </div>
                  </div>
               }
               @if (kpi().zeroStockList.length === 0) {
                  <div class="p-6 rounded-3xl bg-teal-50/50 text-center border border-teal-100">
                     <p class="text-sm font-bold text-primary">Tudo em ordem!</p>
                  </div>
               }
               
               <!-- Static "Check List" style card -->
               <div class="p-4 rounded-2xl bg-sidebar text-white relative group hover:scale-[1.02] transition-transform mt-auto shadow-lg">
                   <div class="flex items-center gap-4">
                      <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      </div>
                      <div>
                         <h4 class="font-bold text-white text-xs">Relatório Diário</h4>
                         <p class="text-[10px] text-gray-400">Verificar pendências.</p>
                      </div>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements AfterViewInit {
  db = inject(DbService);
  kpi = this.db.kpi;
  today = new Date();
  
  chartRef = viewChild<ElementRef>('chartContainer');
  donutRef = viewChild<ElementRef>('donutContainer');

  constructor() {
    effect(() => {
      this.renderBarChart();
      this.renderDonutChart();
    });
  }

  ngAfterViewInit() {
    this.renderBarChart();
    this.renderDonutChart();
    window.addEventListener('resize', () => {
      this.renderBarChart();
      this.renderDonutChart();
    });
  }

  // 1. BAR CHART
  renderBarChart() {
    const el = this.chartRef()?.nativeElement;
    if(!el) return;
    d3.select(el).selectAll('*').remove();

    const data = this.kpi().weeklyData; 
    if (data.length === 0) return;

    const margin = {top: 10, right: 0, bottom: 20, left: 25};
    const width = el.offsetWidth - margin.left - margin.right;
    const height = el.offsetHeight - margin.top - margin.bottom;

    const svg = d3.select(el).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
      .domain(data.map((d: any) => d.day))
      .rangeRound([0, width])
      .paddingInner(0.3);

    const x1 = d3.scaleBand()
      .domain(['in', 'out'])
      .rangeRound([0, x0.bandwidth()])
      .padding(0.2);

    const maxY = d3.max(data, (d: any) => Math.max(d.in, d.out)) || 10;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.2]) 
      .rangeRound([height, 0]);

    const z = d3.scaleOrdinal()
      .domain(['in', 'out'])
      .range(['#007E7A', '#F1C40F']); 

    // Custom Grid
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
        .style("stroke-dasharray", "4,4")
        .style("stroke", "#E5E7EB")
        .style("stroke-opacity", "0.5");

    // Bars
    svg.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${x0(d.day)},0)`)
      .selectAll("path") 
      .data((d: any) => [{key: 'in', value: d.in}, {key: 'out', value: d.out}])
      .enter().append("path")
      .attr("fill", (d: any) => z(d.key) as string)
      .attr("d", (d: any) => {
          const barWidth = x1.bandwidth();
          const barHeight = height - y(d.value);
          const x = x1(d.key)!;
          const yPos = y(d.value);
          const r = Math.min(barWidth / 2, 6); 
          
          return `
            M${x},${yPos + height - y(d.value)} 
            V${yPos + r} 
            Q${x},${yPos} ${x + r},${yPos} 
            H${x + barWidth - r} 
            Q${x + barWidth},${yPos} ${x + barWidth},${yPos + r} 
            V${yPos + barHeight} 
            Z
          `;
      })
      .style("opacity", 0) 
      .transition()
      .duration(800)
      .delay((d: any, i: number) => i * 50)
      .style("opacity", 1);

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .attr("dy", "15px");

    // Y Axis Labels
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", "11px")
      .style("font-weight", "500");

    svg.selectAll(".domain").remove();
  }

  // 2. DONUT CHART (High Contrast for Dark Card)
  renderDonutChart() {
    const el = this.donutRef()?.nativeElement;
    if(!el) return;
    d3.select(el).selectAll('*').remove();

    const width = 220;
    const height = 220;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;
    const score = this.kpi().healthScore;

    const svg = d3.select(el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Data: [Score, Remaining]
    const data = { a: score, b: 100 - score };
    
    // NEW COLORS FOR DARK MODE: 
    // Active: Bright Teal (#007E7A -> lighter #26A69A for contrast or keep brand)
    // Inactive: Dark Grey (#4B5563) to blend with sidebar but be visible
    const color = d3.scaleOrdinal()
      .domain(["a", "b"])
      .range(["#007E7A", "#4B5563"]); 

    const pie = d3.pie()
      .value((d: any) => d[1])
      .sort(null);

    const data_ready = pie(Object.entries(data));

    const arc = d3.arc()
      .innerRadius(radius * 0.75) 
      .outerRadius(radius)
      .cornerRadius(10); 

    svg
      .selectAll('path')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data[0]))
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .attrTween("d", function(d: any) {
        const i = d3.interpolate(d.startAngle+0.1, d.endAngle);
        return function(t: any) {
          d.endAngle = i(t);
          return arc(d);
        }
      })
      .style("opacity", 1);
  }
}