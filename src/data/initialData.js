export const initialProducts = [
  { id: 'PRD-001', name: 'Notebook Pro 15', category: 'Informática', quantity: 24, minimum: 10, price: 4299.9, status: 'Disponível' },
  { id: 'PRD-002', name: 'Mouse sem fio', category: 'Acessórios', quantity: 8, minimum: 12, price: 89.9, status: 'Estoque baixo' },
  { id: 'PRD-003', name: 'Teclado mecânico', category: 'Acessórios', quantity: 36, minimum: 10, price: 249.9, status: 'Disponível' },
  { id: 'PRD-004', name: 'Monitor 27 polegadas', category: 'Informática', quantity: 5, minimum: 8, price: 1199.9, status: 'Estoque baixo' },
  { id: 'PRD-005', name: 'Headset profissional', category: 'Áudio', quantity: 0, minimum: 6, price: 319.9, status: 'Sem estoque' },
  { id: 'PRD-006', name: 'Webcam Full HD', category: 'Periféricos', quantity: 14, minimum: 5, price: 189.9, status: 'Disponível' },
  { id: 'PRD-007', name: 'Processador AMD Ryzen 5 5600', category: 'Processadores', quantity: 9, minimum: 4, price: 799.9, status: 'Disponível' },
  { id: 'PRD-008', name: 'Placa de vídeo GeForce RTX 4060 8GB', category: 'Placas de vídeo', quantity: 3, minimum: 5, price: 2199.9, status: 'Estoque baixo' },
  { id: 'PRD-009', name: 'Memória RAM DDR4 16GB 3200MHz', category: 'Memória RAM', quantity: 18, minimum: 8, price: 229.9, status: 'Disponível' },
  { id: 'PRD-010', name: 'SSD NVMe 1TB', category: 'Armazenamento', quantity: 11, minimum: 5, price: 389.9, status: 'Disponível' },
  { id: 'PRD-011', name: 'Fonte 650W 80 Plus Bronze', category: 'Fontes', quantity: 4, minimum: 6, price: 349.9, status: 'Estoque baixo' },
  { id: 'PRD-012', name: 'Placa-mãe B550M', category: 'Placas-mãe', quantity: 7, minimum: 3, price: 629.9, status: 'Disponível' },
  { id: 'PRD-013', name: 'Gabinete Mid Tower Mesh', category: 'Gabinetes', quantity: 6, minimum: 3, price: 279.9, status: 'Disponível' },
  { id: 'PRD-014', name: 'Cooler para processador 120mm', category: 'Refrigeração', quantity: 2, minimum: 5, price: 119.9, status: 'Estoque baixo' },
  { id: 'PRD-015', name: 'Monitor IPS 24 polegadas', category: 'Informática', quantity: 10, minimum: 4, price: 799.9, status: 'Disponível' },
  { id: 'PRD-016', name: 'Mouse gamer RGB 7200 DPI', category: 'Periféricos', quantity: 15, minimum: 6, price: 139.9, status: 'Disponível' }
];

export const initialActivities = [
  { title: 'Entrada de produtos', detail: 'Reposição de 12 unidades · Notebook Pro 15', time: 'Hoje, 09:42', type: 'entrada' },
  { title: 'Saída de produtos', detail: 'Venda de 4 unidades · Teclado mecânico', time: 'Hoje, 09:18', type: 'saida' },
  { title: 'Estoque atualizado', detail: 'Contagem ajustada · Mouse sem fio', time: 'Ontem, 16:30', type: 'ajuste' }
];

export const categoryData = [
  { name: 'Informática', count: 2, share: '13%' },
  { name: 'Acessórios', count: 2, share: '13%' },
  { name: 'Periféricos', count: 2, share: '13%' },
  { name: 'Processadores', count: 1, share: '6%' },
  { name: 'Placas de vídeo', count: 1, share: '6%' },
  { name: 'Memória RAM', count: 1, share: '6%' },
  { name: 'Armazenamento', count: 1, share: '6%' },
  { name: 'Fontes', count: 1, share: '6%' },
  { name: 'Placas-mãe', count: 1, share: '6%' },
  { name: 'Gabinetes', count: 1, share: '6%' },
  { name: 'Refrigeração', count: 1, share: '6%' },
  { name: 'Áudio', count: 1, share: '6%' }
];

export const supplierData = [
  { name: 'Distribuidora Tech (exemplo)', detail: 'Processadores, placas-mãe e memória', initials: 'DT' },
  { name: 'Componentes PC (exemplo)', detail: 'Placas de vídeo e armazenamento', initials: 'CP' },
  { name: 'Periféricos Brasil (exemplo)', detail: 'Teclados, mouses e headsets', initials: 'PB' },
  { name: 'Hardware & Cia (exemplo)', detail: 'Gabinetes, fontes e refrigeração', initials: 'HC' }
];
