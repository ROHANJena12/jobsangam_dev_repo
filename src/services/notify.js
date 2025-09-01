import { read, write } from './store';

const key = (email) => 'hh_notify_' + (email || 'anon');

export const notify = {
  /** Push a notification to a user's inbox. */
  push(toEmail, { type='info', title, body, link, when } = {}){
    const arr = read(key(toEmail), []) || [];
    arr.unshift({ id: Date.now() + Math.random(), type, title, body, link, read:false, when: when || new Date().toISOString() });
    write(key(toEmail), arr);
  },
  list(email){ return read(key(email), []) || [] },
  unreadCount(email){ return (this.list(email)||[]).filter(n=>!n.read).length },
  markAllRead(email){
    const arr = (this.list(email)||[]).map(n=>({...n, read:true}));
    write(key(email), arr);
  },
  clear(email){ write(key(email), []) }
};