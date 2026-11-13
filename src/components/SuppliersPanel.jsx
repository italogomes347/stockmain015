import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, Users, X } from 'lucide-react';

async function request(action, payload = {}) {
  const response = await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ action, ...payload }) });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error('Resposta inválida do servidor.'); }
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}
const blank = { name: '', email: '', password: '', role: 'supplier' };

export default function SuppliersPanel({ role = 'user' }) {
  const admin = role === 'admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [form, setForm] = useState(blank);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const result = await request(admin ? 'listManagedUsers' : 'getSupplierDirectory');
      setUsers(result.users || []);
      if (!quiet) setError('');
    } catch (e) {
      if (!quiet) setError(e.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [admin]);
  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(() => refresh(true), 5000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  const create = () => { setEditing(null); setForm(blank); setFormOpen(true); setResetTarget(null); setError(''); };
  const edit = (item) => { setEditing(item); setForm({ name: item.name, email: item.email, password: '', role: item.role === 'supplier' ? 'supplier' : 'user' }); setFormOpen(true); setResetTarget(null); setError(''); };

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (editing) await request('updateManagedUser', { userId: editing.id, name: form.name, email: form.email, role: form.role });
      else await request('createManagedUser', form);
      setFormOpen(false); setEditing(null); setForm(blank);
      setNotice(editing ? 'Conta atualizada.' : 'Conta criada. O usuário já pode fazer login.');
      await refresh();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const reset = async (event) => {
    event.preventDefault(); if (!resetTarget) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await request('resetManagedPassword', { userId: resetTarget.id, password: newPassword });
      setResetTarget(null); setNewPassword('');
      setNotice('Senha redefinida. Entregue a nova senha diretamente ao usuário.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Excluir a conta de ${item.name} (${item.email})? Os arquivos de estoque também serão enviados à lixeira do Drive.`)) return;
    setBusy(true); setError(''); setNotice('');
    try { await request('deleteManagedUser', { userId: item.id }); setNotice('Conta excluída.'); await refresh(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const suppliers = users.filter((u) => u.role === 'supplier').length;
  const normals = users.filter((u) => u.role === 'user').length;

  return <div className="supplier-admin">
    <section className="welcome-section supplier-admin__welcome">
      <div><div className="eyebrow"><Users size={14} /> {admin ? 'ADMINISTRAÇÃO DE ACESSOS' : 'REDE DE FORNECEDORES'}</div><h1>{admin ? 'Fornecedores e contas' : 'Fornecedores'}</h1><p>{admin ? 'Crie contas, escolha o perfil e gerencie os acessos ao StockMain.' : 'Diretório de contas cadastradas com perfil de fornecedor.'}</p></div>
      <div className="supplier-admin__toolbar"><button className="button button--secondary" type="button" onClick={refresh} disabled={loading || busy}><RefreshCw size={15}/> Atualizar</button>{admin && <button className="button button--primary" type="button" onClick={create}><Plus size={16}/> Criar conta</button>}</div>
    </section>

    <section className="supplier-admin__stats">
      <article><Users size={19}/><div><small>{admin ? 'Contas cadastradas' : 'Fornecedores'}</small><strong>{users.length}</strong></div></article>
      {admin && <article><ShieldCheck size={19}/><div><small>Contas fornecedor</small><strong>{suppliers}</strong></div></article>}
      {admin && <article><Users size={19}/><div><small>Contas normais</small><strong>{normals}</strong></div></article>}
    </section>
    {notice && <div className="supplier-admin__notice" role="status">{notice}</div>}
    {error && <div className="supplier-admin__error" role="alert">{error}</div>}

    {admin && formOpen && <section className="panel supplier-admin__form-panel">
      <div className="panel__header"><div><h2>{editing ? 'Editar conta' : 'Criar nova conta'}</h2><p>{editing ? 'Altere os dados e as permissões.' : 'O usuário poderá entrar assim que a conta for criada.'}</p></div><button className="icon-button" type="button" onClick={() => setFormOpen(false)}><X size={17}/></button></div>
      <form className="supplier-admin__form" onSubmit={save}>
        <label>Nome completo<input value={form.name} onChange={e => setForm(v => ({...v,name:e.target.value}))} minLength={2} maxLength={80} required/></label>
        <label>E-mail<input type="email" value={form.email} onChange={e => setForm(v => ({...v,email:e.target.value}))} maxLength={254} required/></label>
        <label>Tipo de conta<select value={form.role} onChange={e => setForm(v => ({...v,role:e.target.value}))}><option value="supplier">Fornecedor — vê esta aba</option><option value="user">Normal — não vê esta aba</option></select></label>
        {!editing && <label>Senha inicial<input type="password" value={form.password} onChange={e => setForm(v => ({...v,password:e.target.value}))} minLength={10} maxLength={128} autoComplete="new-password" required/><small>Mínimo de 10 caracteres.</small></label>}
        <div className="supplier-admin__form-actions"><button className="button button--secondary" type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Salvando...' : editing ? 'Salvar' : 'Criar conta'}</button></div>
      </form>
    </section>}

    {admin && resetTarget && <section className="panel supplier-admin__form-panel">
      <div className="panel__header"><div><h2>Redefinir senha</h2><p>{resetTarget.name} · {resetTarget.email}</p></div><button className="icon-button" type="button" onClick={() => setResetTarget(null)}><X size={17}/></button></div>
      <form className="supplier-admin__form" onSubmit={reset}><label>Nova senha<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={10} maxLength={128} autoComplete="new-password" required/><small>A senha atual nunca é exibida. Você pode definir uma nova senha.</small></label><div className="supplier-admin__form-actions"><button className="button button--secondary" type="button" onClick={() => setResetTarget(null)}>Cancelar</button><button className="button button--primary" type="submit" disabled={busy}>Redefinir senha</button></div></form>
    </section>}

    <section className="panel supplier-admin__list-panel">
      <div className="panel__header"><div><h2>{admin ? 'Contas cadastradas' : 'Diretório de fornecedores'}</h2><p>{admin ? 'Usuários registrados nesta aplicação.' : 'Somente contas com perfil de fornecedor.'}</p></div><span className="supplier-admin__count">{users.length} {users.length === 1 ? 'conta' : 'contas'}</span></div>
      {loading ? <div className="supplier-admin__empty"><RefreshCw size={20}/> Carregando dados do Google Drive...</div> : users.length === 0 ? <div className="supplier-admin__empty"><Users size={24}/><strong>Nenhuma conta encontrada</strong><span>{admin ? 'Crie uma conta para começar.' : 'Ainda não há fornecedores cadastrados.'}</span></div> :
        <div className="supplier-admin__table-wrap"><table className="supplier-admin__table"><thead><tr><th>USUÁRIO</th><th>E-MAIL</th><th>PERFIL</th><th>CADASTRO</th>{admin && <th>AÇÕES</th>}</tr></thead><tbody>
          {users.map(item => <tr key={item.id}><td><div className="supplier-admin__identity"><span>{(item.name || 'U').slice(0,2).toUpperCase()}</span><strong>{item.name}</strong></div></td><td>{item.email}</td><td><span className={`supplier-admin__role supplier-admin__role--${item.role}`}>{item.role === 'admin' ? 'Administrador' : item.role === 'supplier' ? 'Fornecedor' : 'Conta normal'}</span></td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '—'}</td>{admin && <td><div className="supplier-admin__actions">{item.role === 'admin' ? <span className="supplier-admin__protected"><ShieldCheck size={14}/> Protegido</span> : <><button className="icon-button" type="button" title="Editar conta" onClick={() => edit(item)} disabled={busy}><Pencil size={15}/></button><button className="icon-button" type="button" title="Redefinir senha" onClick={() => {setResetTarget(item);setFormOpen(false);setNewPassword('');}} disabled={busy}><KeyRound size={15}/></button><button className="icon-button supplier-admin__delete" type="button" title="Excluir conta" onClick={() => remove(item)} disabled={busy}><Trash2 size={15}/></button></>}</div></td>}</tr>)}
        </tbody></table></div>}
      <div className="supplier-admin__security"><ShieldCheck size={16}/><span>As senhas são armazenadas com hash criptográfico e nunca são exibidas. O administrador pode redefini-las, mas não consultar a senha atual.</span></div>
    </section>
  </div>;
}
