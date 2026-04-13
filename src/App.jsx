import { useMemo, useState } from 'react';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'admin123';
const WHATSAPP_NUMBER = '5511999999999';

const defaultServices = [
  'Manutenção de computador',
  'Manutenção de notebook',
  'Troca de peças',
  'Venda de peças',
  'Venda de computador',
  'Venda de notebook',
  'Venda de celular',
  'Venda de tablet',
  'Instalação de Windows e programas diversos',
  'Programas especiais',
  'Rede cabeada',
  'Rede Wi-Fi',
  'Recuperação de dados',
];

const today = new Date().toISOString().slice(0, 10);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [services, setServices] = useState(defaultServices);
  const [newService, setNewService] = useState('');
  const [selectedService, setSelectedService] = useState(defaultServices[0]);

  const [attendance, setAttendance] = useState({
    clientName: '',
    phone: '',
    service: defaultServices[0],
    notes: '',
    date: today,
    value: '',
  });
  const [records, setRecords] = useState([]);
  const [reportDate, setReportDate] = useState(today);

  const servicesOfferLink = useMemo(() => {
    const message = `Oferta de serviços de TI:
- ${services.join('\n- ')}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [services]);

  const singleServiceOfferLink = useMemo(() => {
    const message = `Oferta especial: ${selectedService}. Entre em contato para orçamento!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [selectedService]);

  const filteredRecords = useMemo(
    () => records.filter((record) => record.date === reportDate),
    [records, reportDate],
  );

  const totalValue = useMemo(
    () => filteredRecords.reduce((acc, record) => acc + Number(record.value || 0), 0),
    [filteredRecords],
  );

  const handleLogin = (event) => {
    event.preventDefault();
    if (login.username === ADMIN_USER && login.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      return;
    }
    setLoginError('Usuário ou senha inválidos.');
  };

  const handleAddService = (event) => {
    event.preventDefault();
    if (!newService.trim()) return;
    if (services.some((service) => service.toLowerCase() === newService.trim().toLowerCase())) return;

    const updatedServices = [...services, newService.trim()];
    setServices(updatedServices);
    setSelectedService(newService.trim());
    setAttendance((prev) => ({ ...prev, service: newService.trim() }));
    setNewService('');
  };

  const handleAttendanceSubmit = (event) => {
    event.preventDefault();
    if (!attendance.clientName.trim() || !attendance.service) return;

    setRecords((prev) => [
      {
        ...attendance,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setAttendance((prev) => ({
      ...prev,
      clientName: '',
      phone: '',
      notes: '',
      value: '',
    }));
  };

  const exportToPdf = () => {
    const reportHtml = `
      <html>
        <head>
          <title>Relatório de atendimentos - ${reportDate}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { border-collapse: collapse; width: 100%; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            h1 { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>Relatório de atendimentos</h1>
          <p>Data: ${reportDate.split('-').reverse().join('/')}</p>
          <p>Total de atendimentos: ${filteredRecords.length} | Total faturado: R$ ${totalValue.toFixed(2)}</p>
          <table>
            <thead>
              <tr><th>Cliente</th><th>Serviço</th><th>Telefone</th><th>Valor</th><th>Observações</th></tr>
            </thead>
            <tbody>
              ${filteredRecords
                .map(
                  (record) => `<tr>
                    <td>${record.clientName}</td>
                    <td>${record.service}</td>
                    <td>${record.phone || '-'}</td>
                    <td>R$ ${Number(record.value || 0).toFixed(2)}</td>
                    <td>${record.notes || '-'}</td>
                  </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!isAuthenticated) {
    return (
      <main className="container login-container">
        <h1>Painel do Analista de TI</h1>
        <p className="subtitle">Acesso exclusivo do administrador</p>
        <form onSubmit={handleLogin} className="card form-grid">
          <label>
            Usuário
            <input
              type="text"
              value={login.username}
              onChange={(event) => setLogin((prev) => ({ ...prev, username: event.target.value }))}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={login.password}
              onChange={(event) => setLogin((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit">Entrar</button>
          <small>Credenciais padrão: admin / admin123</small>
        </form>
      </main>
    );
  }

  return (
    <main className="container">
      <header>
        <h1>Painel de Serviços de Informática</h1>
        <p className="subtitle">Gestão de serviços, atendimento e relatórios</p>
      </header>

      <section className="card">
        <h2>Serviços e ofertas</h2>
        <form onSubmit={handleAddService} className="inline-form">
          <input
            type="text"
            placeholder="Novo serviço"
            value={newService}
            onChange={(event) => setNewService(event.target.value)}
          />
          <button type="submit">Adicionar serviço</button>
        </form>

        <div className="chips">
          {services.map((service) => (
            <button
              type="button"
              key={service}
              className={`chip ${selectedService === service ? 'chip-selected' : ''}`}
              onClick={() => {
                setSelectedService(service);
                setAttendance((prev) => ({ ...prev, service }));
              }}
            >
              {service}
            </button>
          ))}
        </div>

        <div className="actions">
          <a href={singleServiceOfferLink} target="_blank" rel="noreferrer" className="link-btn">
            Enviar oferta do serviço selecionado no WhatsApp
          </a>
          <a href={servicesOfferLink} target="_blank" rel="noreferrer" className="link-btn secondary">
            Enviar catálogo completo no WhatsApp
          </a>
        </div>
      </section>

      <section className="card">
        <h2>Tela de atendimento ao cliente</h2>
        <form onSubmit={handleAttendanceSubmit} className="form-grid two-columns">
          <label>
            Nome do cliente
            <input
              type="text"
              value={attendance.clientName}
              onChange={(event) => setAttendance((prev) => ({ ...prev, clientName: event.target.value }))}
              required
            />
          </label>
          <label>
            Telefone
            <input
              type="text"
              value={attendance.phone}
              onChange={(event) => setAttendance((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>
          <label>
            Serviço
            <select
              value={attendance.service}
              onChange={(event) => setAttendance((prev) => ({ ...prev, service: event.target.value }))}
            >
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input
              type="date"
              value={attendance.date}
              onChange={(event) => setAttendance((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </label>
          <label>
            Valor (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={attendance.value}
              onChange={(event) => setAttendance((prev) => ({ ...prev, value: event.target.value }))}
            />
          </label>
          <label className="full-width">
            Observações
            <textarea
              rows="3"
              value={attendance.notes}
              onChange={(event) => setAttendance((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>
          <button type="submit" className="full-width">Registrar atendimento</button>
        </form>
      </section>

      <section className="card">
        <h2>Relatório de atendimento por data</h2>
        <div className="inline-form">
          <label>
            Selecione a data
            <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
          </label>
          <button type="button" onClick={exportToPdf}>Exportar para PDF</button>
        </div>

        <p>
          Total de atendimentos: <strong>{filteredRecords.length}</strong> | Total faturado:{' '}
          <strong>R$ {totalValue.toFixed(2)}</strong>
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Telefone</th>
                <th>Valor</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">Nenhum atendimento na data selecionada.</td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.clientName}</td>
                    <td>{record.service}</td>
                    <td>{record.phone || '-'}</td>
                    <td>R$ {Number(record.value || 0).toFixed(2)}</td>
                    <td>{record.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
