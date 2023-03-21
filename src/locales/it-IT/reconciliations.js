export default {
  reconciliations: {
    title: 'Riconciliazione',
    subtitle: 'Visualizza le liquidazioni effettuate.',
    list: {
      checkbox: '',
      structure: 'Struttura',
      convention_code: 'Cod. convenzione',
      value_date: 'Data valuta',
      payment_date: 'Data pagamento',
      payment_value: 'Importo (€)',
      bookings: 'Prenotazioni',
      recipient_iban: 'IBAN accredito'
    },
    details: {
      title: 'Dettaglio pagamento',
      fund_booking_id: 'Identificativo fondo',
      payment_date: "Data pagamento",
      payment_value: "Importo (€)",
      status: "Stato prenotazione fondo",
      fund_code_patient: 'Cod. beneficiario',
      fund_code_associate: 'Cod. associato',
      download: {
        report: 'Scarica la lettera di liquidazione',
        invoices: 'Scarica le fatture'
      }
    },
    validation: {
      error: 'Il riconciliamento non è valido.',
      errorTitle: 'Attenzione',
      validatedTitle: 'Dati validi'
    }
  }
}
