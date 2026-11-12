export const initialProducts = [
  { id: 'PRD-001', name: 'Notebook Pro 15', category: 'Informática', quantity: 24, minimum: 10, price: 4299.9, status: 'Disponível' },
  { id: 'PRD-002', name: 'Mouse sem fio', category: 'Acessórios', quantity: 8, minimum: 12, price: 89.9, status: 'Estoque baixo' },
  { id: 'PRD-003', name: 'Teclado mecânico', category: 'Acessórios', quantity: 36, minimum: 10, price: 249.9, status: 'Disponível' },
  { id: 'PRD-004', name: 'Monitor 27 polegadas', category: 'Informática', quantity: 5, minimum: 8, price: 1199.9, status: 'Estoque baixo' },
  { id: 'PRD-005', name: 'Headset profissional', category: 'Áudio', quantity: 0, minimum: 6, price: 319.9, status: 'Sem estoque' }
];

export const initialActivities = [
  { title: 'Entrada de produtos', detail: 'Reposição de 12 unidades · Notebook Pro 15', time: 'Hoje, 09:42', type: 'entrada' },
  { title: 'Saída de produtos', detail: 'Venda de 4 unidades · Teclado mecânico', time: 'Hoje, 09:18', type: 'saida' },
  { title: 'Estoque atualizado', detail: 'Contagem ajustada · Mouse sem fio', time: 'Ontem, 16:30', type: 'ajuste' }
];

export const categoryData = [
  { name: 'Informática', count: 18, share: '42%' },
  { name: 'Acessórios', count: 24, share: '31%' },
  { name: 'Áudio', count: 12, share: '18%' },
  { name: 'Periféricos', count: 9, share: '9%' }
];

export const supplierData = [
  { name: 'Tech Distribuidora', detail: 'Informática e periféricos', initials: 'TD' },
  { name: 'Mundo dos Acessórios', detail: 'Acessórios e componentes', initials: 'MA' },
  { name: 'Áudio Center', detail: 'Equipamentos de áudio', initials: 'AC' }
];
