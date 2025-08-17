import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase.from('produtos').select('*');
        if (error) throw error;
        return res.status(200).json(data);
      }
      case 'POST': {
        const novo = req.body;
        const { data, error } = await supabase.from('produtos').insert([novo]);
        if (error) throw error;
        return res.status(200).json({ message: 'Produto adicionado', produto: data[0] });
      }
      case 'PUT': {
        const { id, ...atualizado } = req.body;
        const { data, error } = await supabase.from('produtos').update(atualizado).eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Produto atualizado', produto: data[0] });
      }
      case 'DELETE': {
        const { id } = req.query;
        const { data, error } = await supabase.from('produtos').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Produto removido', id });
      }
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
