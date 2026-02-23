import { Injectable, signal, computed, inject } from '@angular/core';
import { NotificationService } from './notification.service';
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARjBS1i7OHzsYA5m9Av1cYWXTyQNfLNFQ",
  authDomain: "epi-serra-sull.firebaseapp.com",
  projectId: "epi-serra-sull",
  storageBucket: "epi-serra-sull.firebasestorage.app",
  messagingSenderId: "49100006374",
  appId: "1:49100006374:web:24436329e209345499ac27",
  measurementId: "G-TV91YBKHT0"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export interface Product {
  id: string;
  codigo: string;
  nome: string;
  categoria: 'EPI' | 'UNIFORME';
  estoque_atual: number;
  estoque_min: number;
  estoque_max: number;
  alto_giro: boolean;
  consumo_medio_diario?: number;
  dias_para_acabar?: number;
}

export interface Movement {
  id: string;
  data: string;
  tipo: 'ENTRADA' | 'SAIDA';
  produtoId: string;
  quantidade: number;
  atendente: string;
  centroCusto: string;
  observacao?: string;
}

export interface OrderItem {
  produtoId: string;
  quantidadeSolicitada: number;
  quantidadeRecebida?: number;
}

export interface Order {
  id: string;
  numero: number;
  fornecedor: string;
  dataCriacao: string;
  status: 'PENDENTE' | 'PARCIAL' | 'RECEBIDO' | 'CANCELADO';
  itens: OrderItem[];
  temDivergencia: boolean;
  quemConferiu?: string;
  dataRecebimento?: string;
}

const RAW_DATA = `13172281	ARCTATIL G	EPI
13172256	ARCTATIL GG	EPI
13172279	ARCTATIL M	EPI
13172268	ARCTATIL P	EPI
13316763	ARCTATIL PP	EPI
15282770	BALACLAVA ELETRICA	EPI
15336442	BLOQUEADOR SOLAR	EPI
15731888	BLUSAO VAQUETA G	EPI
15731887	BLUSAO VAQUETA GG	EPI
15731885	BLUSAO VAQUETA M	EPI
15731890	BLUSAO VAQUETA P	EPI
13155971	CALCA ANTICORTE G	EPI
13156020	CALCA ANTICORTE M	EPI
13156010	CALCA ANTICORTE P	EPI
13315829	CALCA JEANS OPERACIONAL MASCULINA 38 COM FAIXA	UNIFORME
13315828	CALCA JEANS OPERACIONAL MASCULINA 40 COM FAIXA	UNIFORME
13315827	CALCA JEANS OPERACIONAL MASCULINA 42 COM FAIXA	UNIFORME
13318786	CALCA JEANS OPERACIONAL MASCULINA 44 COM FAIXA	UNIFORME
13315826	CALCA JEANS OPERACIONAL MASCULINA 46 COM FAIXA	UNIFORME
13315824	CALCA JEANS OPERACIONAL MASCULINA 48 COM FAIXA	UNIFORME
13315825	CALCA JEANS OPERACIONAL MASCULINA 50 COM FAIXA	UNIFORME
13315823	CALCA JEANS OPERACIONAL MASCULINA 52 COM FAIXA	UNIFORME
13022270	CALCA NOMEX FEMININA 36	UNIFORME
15443280	CALCA NOMEX FEMININA 38	UNIFORME
15443318	CALCA NOMEX FEMININA 40	UNIFORME
15443349	CALCA NOMEX FEMININA 42	UNIFORME
15443399	CALCA NOMEX FEMININA 44	UNIFORME
15443484	CALCA NOMEX FEMININA 46	UNIFORME
15443492	CALCA NOMEX FEMININA 48	UNIFORME
15443526	CALCA NOMEX FEMININA 50	UNIFORME
15241357	CALCA NOMEX MASCULINA 38	UNIFORME
15241390	CALCA NOMEX MASCULINA 40	UNIFORME
15241416	CALCA NOMEX MASCULINA 42	UNIFORME
15241423	CALCA NOMEX MASCULINA 44	UNIFORME
15241463	CALCA NOMEX MASCULINA 46	UNIFORME
15241526	CALCA NOMEX MASCULINA 48	UNIFORME
15241532	CALCA NOMEX MASCULINA 50	UNIFORME
15241572	CALCA NOMEX MASCULINA 52	UNIFORME
15241682	CALCA NOMEX MASCULINA 60	UNIFORME
15734019	CALCA VAQUETA G	EPI
15733378	CALCA VAQUETA GG	EPI
15734036	CALCA VAQUETA M	EPI
15731886	CALCA VAQUETA P	EPI
16724419	CAMISA ADM FEM CURTA 36	UNIFORME
16724632	CAMISA ADM FEM CURTA 38	UNIFORME
15500269	CAMISA ADM FEM CURTA 40	UNIFORME
16724557	CAMISA ADM FEM CURTA 42	UNIFORME
16724179	CAMISA ADM FEM CURTA 44	UNIFORME
16724435	CAMISA ADM FEM CURTA 46	UNIFORME
16724631	CAMISA ADM FEM CURTA 48	UNIFORME
16724654	CAMISA ADM FEM CURTA 50	UNIFORME
15500271	CAMISA ADM FEM CURTA 52	UNIFORME
16724434	CAMISA ADM FEM CURTA 54	UNIFORME
16724553	CAMISA ADM FEM LONGA 36	UNIFORME
16724680	CAMISA ADM FEM LONGA 40	UNIFORME
16724660	CAMISA ADM FEM LONGA 42	UNIFORME
16724177	CAMISA ADM FEM LONGA 44	UNIFORME
16724469	CAMISA ADM FEM LONGA 46	UNIFORME
16725132	CAMISA ADM FEM LONGA 48	UNIFORME
16724653	CAMISA ADM FEM LONGA 50	UNIFORME
16724436	CAMISA ADM FEM LONGA 52	UNIFORME
16724652	CAMISA ADM FEM LONGA 54	UNIFORME
16724400	CAMISA ADM MASC CURTA 1	UNIFORME
16724357	CAMISA ADM MASC CURTA 10	UNIFORME
16724412	CAMISA ADM MASC CURTA 2	UNIFORME
16724642	CAMISA ADM MASC CURTA 3	UNIFORME
16724406	CAMISA ADM MASC CURTA 4	UNIFORME
16724290	CAMISA ADM MASC CURTA 5	UNIFORME
16725084	CAMISA ADM MASC CURTA 6	UNIFORME
16724640	CAMISA ADM MASC CURTA 7	UNIFORME
16724679	CAMISA ADM MASC CURTA 8	UNIFORME
16724399	CAMISA ADM MASC CURTA 9	UNIFORME
16724398	CAMISA ADM MASC LONGA 1	UNIFORME
16724524	CAMISA ADM MASC LONGA 10	UNIFORME
16725077	CAMISA ADM MASC LONGA 2	UNIFORME
16724307	CAMISA ADM MASC LONGA 3	UNIFORME
16724431	CAMISA ADM MASC LONGA 4	UNIFORME
16724426	CAMISA ADM MASC LONGA 5	UNIFORME
16724304	CAMISA ADM MASC LONGA 6	UNIFORME
16724678	CAMISA ADM MASC LONGA 7	UNIFORME
16724648	CAMISA ADM MASC LONGA 8	UNIFORME
16724405	CAMISA ADM MASC LONGA 9	UNIFORME
15446037	CAMISA NOMEX FEMININO 1	UNIFORME
15446067	CAMISA NOMEX FEMININO 2	UNIFORME
15446155	CAMISA NOMEX FEMININO 3	UNIFORME
15446162	CAMISA NOMEX FEMININO 4	UNIFORME
15446200	CAMISA NOMEX FEMININO 5	UNIFORME
15446238	CAMISA NOMEX FEMININO 6	UNIFORME
15240043	CAMISA NOMEX MASCULINO 1	UNIFORME
15240081	CAMISA NOMEX MASCULINO 2	UNIFORME
15240119	CAMISA NOMEX MASCULINO 3	UNIFORME
15240146	CAMISA NOMEX MASCULINO 4	UNIFORME
15240196	CAMISA NOMEX MASCULINO 5	UNIFORME
15243661	CAMISA NOMEX MASCULINO 6	UNIFORME
15243721	CAMISA NOMEX MASCULINO 7	UNIFORME
16724420	CAMISA OPERACIONAL FEM LONGA 36	UNIFORME
16724655	CAMISA OPERACIONAL FEM LONGA 38	UNIFORME
16724370	CAMISA OPERACIONAL FEM LONGA 40	UNIFORME
16724635	CAMISA OPERACIONAL FEM LONGA 42	UNIFORME
16724513	CAMISA OPERACIONAL FEM LONGA 44	UNIFORME
16724421	CAMISA OPERACIONAL FEM LONGA 46	UNIFORME
16724178	CAMISA OPERACIONAL FEM LONGA 48	UNIFORME
16724372	CAMISA OPERACIONAL FEM LONGA 50	UNIFORME
16724046	CAMISA OPERACIONAL FEM LONGA 52	UNIFORME
16724437	CAMISA OPERACIONAL FEM LONGA 54	UNIFORME
16724045	CAMISA OPERACIONAL MASC LONGA 1	UNIFORME
16724306	CAMISA OPERACIONAL MASC LONGA 10	UNIFORME
16725133	CAMISA OPERACIONAL MASC LONGA 2	UNIFORME
16724684	CAMISA OPERACIONAL MASC LONGA 3	UNIFORME
16724176	CAMISA OPERACIONAL MASC LONGA 4	UNIFORME
16724685	CAMISA OPERACIONAL MASC LONGA 5	UNIFORME
16724440	CAMISA OPERACIONAL MASC LONGA 6	UNIFORME
16724649	CAMISA OPERACIONAL MASC LONGA 7	UNIFORME
16724641	CAMISA OPERACIONAL MASC LONGA 8	UNIFORME
16724432	CAMISA OPERACIONAL MASC LONGA 9	UNIFORME
16724643	CAMISA OPERACIONAL MASCULINO CURTA 1	UNIFORME
16724659	CAMISA OPERACIONAL MASCULINO CURTA 2	UNIFORME
16724418	CAMISA OPERACIONAL MASCULINO CURTA 3	UNIFORME
16724658	CAMISA OPERACIONAL MASCULINO CURTA 4	UNIFORME
16724413	CAMISA OPERACIONAL MASCULINO CURTA 5	UNIFORME
16724416	CAMISA OPERACIONAL MASCULINO CURTA 6	UNIFORME
16724651	CAMISA OPERACIONAL MASCULINO CURTA 7	UNIFORME
16724650	CAMISA OPERACIONAL MASCULINO CURTA 8	UNIFORME
13306824	CAMISA POLO FEMININO G	UNIFORME
13306790	CAMISA POLO FEMININO M	UNIFORME
13306417	CAMISA POLO FEMININO P	UNIFORME
13306993	CAMISA POLO FEMININO PP	UNIFORME
13306600	CAMISA POLO MASCULINO G	UNIFORME
13306601	CAMISA POLO MASCULINO M	UNIFORME
13306602	CAMISA POLO MASCULINO P	UNIFORME
13306603	CAMISA POLO MASCULINO PP	UNIFORME
15421866	CAPA CHUVA G	EPI
15421908	CAPA CHUVA M	EPI
15421828	CAPA CHUVA XG	EPI
15251624	CAPACETE 3M	EPI
15255670	CAPACETE MSA	EPI
13094454	CAPUZ ALTA TEMPERATURA PRETA	EPI
16903219	CINTO SEGURANÇA	EPI
15774895	COLETE LARANJA G	EPI
15775001	COLETE LARANJA M	EPI
13303524	COLETE LARANJA P	EPI
15774880	COLETE LARANJA XG	EPI
15775002	COLETE LARANJA XXG	EPI
16724564	CREME BISNAGA 100G	EPI
13103195	ELASTICO SOLUS 1000	EPI
13103209	ESPUMA DE VEDACAO SOLUS 1000	EPI
15513815	FILTRO  P2	EPI
15779064	FILTRO P3	EPI
15299596	FILTRO PLASTICO	EPI
13094254	GRIP DEFENDER APOIO 10	EPI
13093459	GRIP DEFENDER APOIO 11	EPI
13091909	GRIP DEFENDER APOIO 7	EPI
13093452	GRIP DEFENDER APOIO 9	EPI
15426150	HYFLEX 10	EPI
15225095	HYFLEX 7	EPI
15426072	HYFLEX 8	EPI
15426108	HYFLEX 9	EPI
15224469	JUGULAR ELASTICO 3M	EPI
15207157	JUGULAR ELASTICO MSA	EPI
15309085	JUGULAR TECIDO 3M	EPI
13075586	KIT SOLUS 1000 INCOLOR	EPI
13296364	LUVA ANTI-IMPACTO UNILUVAS 10	EPI
13296363	LUVA ANTI-IMPACTO UNILUVAS 11	EPI
13296361	LUVA ANTI-IMPACTO UNILUVAS 12	EPI
13296238	LUVA ANTI-IMPACTO UNILUVAS 8	EPI
13296237	LUVA ANTI-IMPACTO UNILUVAS 9	EPI
15256728	SUSPENSAO MSA	EPI
16905195	TALABARTE	EPI
15402906	VISOR 3M EXTERNA	EPI
15402912	VISOR 3M INTERNA 9100V	EPI
13109502	VISOR 3M INTERNA 9100X	EPI
15500155	SOLVEX 10	EPI
15500129	SOLVEX 9	EPI
13155522	RESPIRADOR DESCART DOBRAVEL PFF2	EPI
15428487	RESPIRADOR DESCART SEMI-FACIAL PFF2	EPI
15382121	LUVA VAQUETA EG	EPI
15382170	LUVA VAQUETA G	EPI
15427777	LUVA VAQUETA M	EPI
15382196	LUVA VAQUETA P	EPI
13093448	LUVAMAX GRIP G	EPI
13093446	LUVAMAX GRIP M	EPI
13329496	MACACAO 36/38 XP	EPI
15510673	MACACAO 40/42 PP	EPI
15510689	MACACAO 44/46 P	EPI
15510718	MACACAO 48/50 M	EPI
15510734	MACACAO 52/54 G	EPI
15510742	MACACAO 56/58 GG	EPI
15510760	MACACAO 60/62 GG	EPI
13306816	MACACAO PROTECAO G	EPI
13306812	MACACAO PROTECAO GG	EPI
13306810	MACACAO PROTECAO GGG	EPI
13306777	MACACAO PROTECAO M	EPI
13306780	MACACAO PROTECAO P	EPI
15430145	MACACAO TYVEK G	EPI
15430110	MACACAO TYVEK GG	EPI
15430152	MACACAO TYVEK M	EPI
15346004	MACACAO TYVEK P	EPI
15375669	MASCARA SEMI FACIAL 3M	EPI
15412654	MASCARA SOLDA PC C/ CARNEIRA	EPI
13033811	OCULOS GRADUADO MONOFOCAL, LENTE FOTOCROMATICA, HA	EPI
13031060	OCULOS GRADUADO MONOFOCAL, LENTE INCOLOR, BANDA EL	EPI
13031065	OCULOS GRADUADO MONOFOCAL, LENTE INCOLOR, HASTE AJ	EPI
13030411	OCULOS GRADUADO MULTIFOCAL, LENTE INCOLOR, BANDA E	EPI
15411403	OCULOS INCOLOR HONEYWELL	EPI
15397699	OCULOS LENTE VERDE 5.0	EPI
15411313	OCULOS LENTES IN-OUT	EPI
15411855	OCULOS LIBUS CINZA	EPI
15410806	OCULOS LIBUS INCOLOR	EPI
15397582	OCULOS SEG AMPLA VISAO INC	EPI
13033261	OCULOS SEG CONT IMPACT PART FOTOCR	EPI
13031049	OCULOS SEG CONT IMPACT PART FOTOCRO	EPI
13033248	OCULOS SEG CONT IMPACT PART INC	EPI
15411129	OCULOS SOBREPOR	EPI
13108456	OCULOS SOLUS 1000 CINZA	EPI
15734078	PERNEIRA DE RASPA COM VELCRO	EPI
15427000	PERNEIRA PVC LAMIN G	EPI
15417364	POWERFLEX 10	EPI
15417293	POWERFLEX 8	EPI
15417327	POWERFLEX 9	EPI
15217798	PROTETOR ACOPLAR CONCHA H6P3E 3M	EPI
15391654	PROTETOR AURICULAR CONCHA MSA 22DB	EPI
15394816	PROTETOR AURICULAR CONCHA TP 19DB VERDE	EPI
15394283	PROTETOR AURICULAR CONCHA TP 3M CIMA DA CABECA	EPI
15213210	PROTETOR AURICULAR HASTE TRAS DA NUCA CONCHA 19DB	EPI
15427128	PROTETOR FACIAL V2C 3M	EPI
15254231	PROTETOR HASTE METAL ACIMA CABECA 27DB PRETO	EPI
15304872	PROTETOR PLUG	EPI
15398377	REPELENTE	EPI
13321020	LUVA MAX SOLDER G	EPI
13320947	LUVA MAX SOLDER GG	EPI
13321021	LUVA MAX SOLDER M	EPI
13321321	LUVA MAX SOLDER P	EPI`;

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private notificationService = inject(NotificationService);

  private baseProducts: Product[] = [];

  products = signal<Product[]>([]);
  movements = signal<Movement[]>([]);
  orders = signal<Order[]>([]);

  private isSeeding = false;

  kpi = computed(() => {
    const products = this.products();
    const movements = this.movements();

    // Total numbers
    const totalOut = movements.filter(m => m.tipo === 'SAIDA').reduce((acc, m) => acc + m.quantidade, 0);
    const totalIn = movements.filter(m => m.tipo === 'ENTRADA').reduce((acc, m) => acc + m.quantidade, 0);
    const positiveStock = products.filter(p => p.estoque_atual > p.estoque_min).length;
    const zeroStockList = products.filter(p => p.estoque_atual === 0);
    const zeroStock = zeroStockList.length;
    const healthScore = products.length > 0 ? Math.round((positiveStock / products.length) * 100) : 0;

    // Calculate weekly data (last 7 days)
    const weeklyData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });

      const dayMovs = movements.filter(m => m.data.startsWith(dateStr));
      weeklyData.push({
        day: dayName,
        in: dayMovs.filter(m => m.tipo === 'ENTRADA').reduce((acc, m) => acc + m.quantidade, 0),
        out: dayMovs.filter(m => m.tipo === 'SAIDA').reduce((acc, m) => acc + m.quantidade, 0)
      });
    }

    // Top trending
    const productOuts: Record<string, number> = {};
    movements.filter(m => m.tipo === 'SAIDA').forEach(m => {
      productOuts[m.produtoId] = (productOuts[m.produtoId] || 0) + m.quantidade;
    });

    const topTrending = Object.entries(productOuts)
      .map(([id, qtd]) => {
        const prod = products.find(p => p.id === id);
        return {
          name: prod?.nome || 'Item excluído',
          codigo: prod?.codigo,
          qtd
        };
      })
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    // Purchase Action List
    const purchaseActionList = products
      .filter(p => p.estoque_atual > p.estoque_min && p.estoque_atual <= p.estoque_min + 4)
      .sort((a, b) => (a.estoque_atual - a.estoque_min) - (b.estoque_atual - b.estoque_min))
      .slice(0, 100);

    return {
      totalOut,
      totalIn,
      positiveStock,
      zeroStock,
      zeroStockList,
      healthScore,
      weeklyData,
      topTrending,
      purchaseActionList
    };
  });

  constructor() {
    this.preloadLocalData();
    this.setupListeners();
  }

  private preloadLocalData() {
    // Zero-delay loading approach: We load the raw catalog directly into memory synchronously
    // so the user never sees an "empty" screen. Firebase will gracefully override this
    // a fraction of a second later with the true stock balances and full data.
    const lines = RAW_DATA.split('\n').filter(l => l.trim().length > 5);
    const loadedProducts: Product[] = [];
    const addedCodes = new Set<string>();

    lines.forEach(line => {
      let codigo = '';
      let nome = '';
      let categoria: any = 'EPI';

      if (line.includes('\t')) {
        const parts = line.split('\t');
        codigo = parts[0]?.trim();
        nome = parts[1]?.trim();
        categoria = parts[2]?.trim();
      } else {
        const parts = line.trim().split(/\s+/);
        codigo = parts[0];
        categoria = parts[parts.length - 1];
        nome = parts.slice(1, parts.length - 1).join(' ');
        if (categoria !== 'EPI' && categoria !== 'UNIFORME') {
          categoria = 'EPI';
        }
      }

      if (!codigo || !nome) return;
      if (addedCodes.has(codigo)) return;
      addedCodes.add(codigo);

      loadedProducts.push({
        id: codigo, // Temporary string ID to satisfy interface until firebase snap overrides
        codigo,
        nome: nome || 'PRODUTO DESCONHECIDO',
        categoria: (categoria as any) || 'EPI',
        estoque_atual: 0, // Visual only until firebase provides correct number
        estoque_min: 5,
        estoque_max: 100,
        alto_giro: false
      });
    });

    this.baseProducts = loadedProducts;
    this.products.set(loadedProducts);
  }

  private setupListeners() {
    onSnapshot(collection(db, 'products'), (snapshot) => {
      // If Firebase collection is empty AND we got a server response (not just empty cache)
      if (snapshot.empty && !this.isSeeding && !snapshot.metadata.fromCache) {
        this.isSeeding = true;
        this.seedDatabase().then(() => {
          this.isSeeding = false;
        }).catch((e) => {
          console.error("Seeding failed", e);
          this.isSeeding = false;
        });
      } else if (!snapshot.empty) {
        // Only override the preloaded data when Firebase actually returns documents
        const prods = snapshot.docs.map(d => {
          const data = d.data() || {};
          const c = String(data['codigo'] || data['Codigo'] || data['CODIGO'] || d.id || '');
          const base = this.baseProducts.find(b => b.codigo === c || b.codigo === d.id);

          return {
            id: d.id,
            ...data,
            codigo: c,
            nome: String(data['nome'] || data['Nome'] || data['NOME'] || data['descricao'] || data['produto'] || (base ? base.nome : null) || 'Sem Nome'),
            categoria: data['categoria'] || data['Categoria'] || data['CATEGORIA'] || (base ? base.categoria : null) || 'EPI',
            estoque_atual: Number(data['estoque_atual'] ?? data['Estoque_atual'] ?? data['estoque'] ?? data['quantidade'] ?? 0),
            estoque_min: Number(data['estoque_min'] ?? data['estoqueMinimo'] ?? (base ? base.estoque_min : 0)),
            estoque_max: Number(data['estoque_max'] ?? data['estoqueMaximo'] ?? (base ? base.estoque_max : 0)),
            alto_giro: Boolean(data['alto_giro'] || data['Alto_giro'] || false)
          } as Product;
        });
        this.products.set(prods);
      }
    });

    onSnapshot(collection(db, 'movements'), (snapshot) => {
      const movs = snapshot.docs.map(d => {
        const data = d.data() || {};
        return {
          id: d.id,
          ...data,
          data: data['data'] || data['Data'] || new Date().toISOString(),
          tipo: data['tipo'] || data['Tipo'] || 'SAIDA',
          produtoId: data['produtoId'] || data['ProdutoId'] || data['produto_id'] || '',
          quantidade: Number(data['quantidade'] ?? data['Quantidade'] ?? 0),
          atendente: data['atendente'] || data['Atendente'] || 'Admin',
          centroCusto: data['centroCusto'] || data['CentroCusto'] || data['centro_custo'] || '',
          observacao: data['observacao'] || data['Observacao'] || ''
        } as Movement;
      });
      movs.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      this.movements.set(movs);
    });

    onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ords = snapshot.docs.map(d => {
        const data = d.data() || {};
        return {
          id: d.id,
          ...data,
          numero: Number(data['numero'] ?? data['Numero'] ?? 0),
          fornecedor: data['fornecedor'] || data['Fornecedor'] || 'Desconhecido',
          dataCriacao: data['dataCriacao'] || data['DataCriacao'] || data['data_criacao'] || new Date().toISOString(),
          status: data['status'] || data['Status'] || 'PENDENTE',
          itens: data['itens'] || data['Itens'] || [],
          temDivergencia: Boolean(data['temDivergencia'] || data['TemDivergencia'])
        } as Order;
      });
      ords.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
      this.orders.set(ords);
    });
  }

  private seedDatabase() {
    console.log("Seeding database as Firebase is currently empty...");
    const lines = RAW_DATA.split('\n').filter(l => l.trim().length > 5);
    const addedCodes = new Set<string>();

    const batch = writeBatch(db);

    lines.forEach(line => {
      let codigo = '';
      let nome = '';
      let categoria: any = 'EPI';

      if (line.includes('\t')) {
        const parts = line.split('\t');
        codigo = parts[0]?.trim();
        nome = parts[1]?.trim();
        categoria = parts[2]?.trim();
      } else {
        const parts = line.trim().split(/\s+/);
        codigo = parts[0];
        categoria = parts[parts.length - 1];
        nome = parts.slice(1, parts.length - 1).join(' ');
        if (categoria !== 'EPI' && categoria !== 'UNIFORME') {
          categoria = 'EPI';
        }
      }

      if (!codigo || !nome) return;
      if (addedCodes.has(codigo)) return;
      addedCodes.add(codigo);

      const productDoc = doc(collection(db, 'products'), codigo);
      batch.set(productDoc, {
        codigo,
        nome: nome || 'PRODUTO DESCONHECIDO',
        categoria: (categoria as any) || 'EPI',
        estoque_atual: 0,
        estoque_min: 5,
        estoque_max: 100,
        alto_giro: false
      });
    });

    return batch.commit().then(() => {
      console.log("Seeding complete. Products have been loaded to Firebase.");

      this.notificationService.add(
        'Banco de Dados Online',
        'Firebase conectado e sincronizando em tempo real com todos os dispositivos!',
        'SUCCESS'
      );
    });
  }

  updateProduct(id: string, data: Partial<Product>) {
    return setDoc(doc(db, 'products', id), data, { merge: true }).catch(console.error);
  }

  addMovement(movement: Omit<Movement, 'id' | 'data'>) {
    const dataIso = new Date().toISOString();

    const product = this.products().find(p => p.id === movement.produtoId);

    // Fire and forget so we don't block the UI if backend is unreachable
    addDoc(collection(db, 'movements'), {
      ...movement,
      data: dataIso
    }).catch(console.error);

    if (product) {
      const change = movement.tipo === 'ENTRADA' ? movement.quantidade : -movement.quantidade;
      const newStock = Math.max(0, product.estoque_atual + change);

      this.updateProduct(product.id, { estoque_atual: newStock });

      if (movement.tipo === 'SAIDA' && newStock <= product.estoque_min && product.estoque_atual > product.estoque_min) {
        this.notificationService.add(
          'Alerta de Estoque Baixo',
          `O produto ${product.nome} atingiu o nível mínimo (${newStock} un).`,
          'WARNING'
        );
      }

      if (movement.tipo === 'SAIDA' && newStock === 0 && product.estoque_atual > 0) {
        this.notificationService.add(
          'Estoque Zerado',
          `O produto ${product.nome} acabou de zerar!`,
          'ERROR'
        );
      }
    }
  }

  createOrder(orderData: { fornecedor: string, itens: OrderItem[] }) {
    const numero = Math.floor(Math.random() * 10000);
    addDoc(collection(db, 'orders'), {
      numero,
      fornecedor: orderData.fornecedor,
      dataCriacao: new Date().toISOString(),
      status: 'PENDENTE',
      itens: [...orderData.itens],
      temDivergencia: false
    }).catch(console.error);

    this.notificationService.add(
      'Remessa Criada',
      `Remessa #${numero} para ${orderData.fornecedor} foi gerada com sucesso e sincronizada.`,
      'SUCCESS'
    );
  }

  receiveOrder(orderId: string, receivedItems: OrderItem[], conferente: string) {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    for (const item of receivedItems) {
      if (item.quantidadeRecebida && item.quantidadeRecebida > 0) {
        this.addMovement({
          tipo: 'ENTRADA',
          produtoId: item.produtoId,
          quantidade: item.quantidadeRecebida,
          atendente: conferente,
          centroCusto: 'ESTOQUE',
          observacao: `Recebimento Pedido #${order.numero}`
        });
      }
    }

    const temDivergencia = receivedItems.some(i => i.quantidadeRecebida !== i.quantidadeSolicitada);

    setDoc(doc(db, 'orders', orderId), {
      status: 'RECEBIDO',
      itens: receivedItems,
      quemConferiu: conferente,
      dataRecebimento: new Date().toISOString(),
      temDivergencia
    }, { merge: true }).catch(console.error);

    this.notificationService.add(
      'Conferência Realizada',
      'O estoque foi atualizado em todos os aparelhos conectados.',
      'SUCCESS'
    );
  }
}
