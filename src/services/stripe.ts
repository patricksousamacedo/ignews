import Stripe from 'stripe';
import { version } from '../../package.json'; // para pegar a versão do projeto

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY, // chave do stripe
  {
    apiVersion: '2020-08-27', // o stripe sempre muda a versão
    appInfo: {
      name: 'Ignews',
      version // vc também poderia adicionar a versão: '0.1.0'
    }
  }
)