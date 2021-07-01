import { query as q } from 'faunadb';

import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription( 
  subscriptionId: string,
  customerId: string,
  createdAction = false, // foi adicionado para que saiba se a ação é de criação
) {
  
  const userRef = await fauna.query( 
    q.Select( 
      "ref", 
      q.Get( 
        q.Match( 
          q.Index('user_by_stripe_customer_id'), 
          customerId
        )
      )
    )
  )
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const subscriptionData = { 
    id: subscription.id, 
    userId: userRef, 
    status: subscription.status, 
    price_id: subscription.items.data[0].price.id, 

  }

  if (createdAction) { // se estiver criando uma subscription
    await fauna.query(
      q.Create( // então crie uma nova subscription
        q.Collection('subscriptions'),
        { data: subscriptionData }
      )
    )
  } else { // caso contrario atualize a existente
    await fauna.query(
      q.Replace( // é um metodo de atualização, ele substitui a subscription por completo
        q.Select( // selecione
          "ref", // apaenas o campo ref
          q.Get(
            q.Match(
              q.Index('subscription_by_id'), // com esse indice
              subscriptionId,
            )
          )
        ),
        { data: subscriptionData } // vai atualizar esses dados
      )
    )
  }
}
