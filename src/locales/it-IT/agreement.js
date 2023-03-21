export default {
  agreements: {
    title: "Negoziazione",
    subtitle: "Crea o visualizza le negoziazioni",
    list: {
      checkbox: '',
      id: '#',
      valid_from: 'Valida da',
      valid_to: 'Valida a',
      status: 'Stato',
      structure: 'Struttura',
      subscribed_at: 'Sottoscrizione',
      lending_agreements_count: 'Numero prestazioni'
    },
    edit: {
      title: 'Dati negoziazione'
    },
    status: {
      draft: 'Completa i dati di negoziazione e poi clicca "Procedi". Nel caso uno o più costi prestazione siano variati rispetto a quelli proposti, sarà necessaria l\'approvazione della controparte.',
      waitingFondo: 'Si prega di attendere, la Struttura sta compilando la proposta di negoziazione.',
      waitingStructure: 'Si prega di attendere, il Fondo sta verificando la proposta di negoziazione.',
      consolidated: 'I costi prestazione sono stati consolidati, è possibile procedere con la sottoscrizione del contratto.',
      active: 'La negoziazione è attiva',
      rejected: 'La negoziazione è stata annullata.',
      closed: 'La negoziazione è stata chiusa'
    },
    contract: {
      title: 'Accettazione contratto',
      checkbox: 'Accetto'
    }
  }
}
