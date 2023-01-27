export default {
  bookings: {
    title: 'Prenotazioni',
    subtitle: 'Visualizza e modifica le prenotazioni.',
    types: {
      1: 'Ambulatoriale',
      2: 'Ricovero',
      3: 'Odontoiatrica',
      4: 'Prevenzione',
      5: 'Gravi malattie',
    },
    status: {
      1: 'Bozza',
      2: 'Da verificare',
      3: 'Annullata',
      4: 'Respinto',
      5: 'Approvata',
      6: 'Presentata al fondo',
    },
    list: {
      id: '#',
      number: 'Numero',
      type: 'Tipo',
      stato: 'Stato',
      position: 'Posizione',
      nominative: 'Nominativo',
      status: 'Status',
      fiscal_code: 'Codice fiscale',
      structure: 'Struttura'
    },
    edit: {
      title: 'Prenotazione',
      checkUser: {
        submit: 'Cerca',
        userNotFound: 'Nessun utente trovato.',
        select: 'Seleziona',
        kinship: 'Parentela',
        types: {
          main_member: 'Principale',
          son_daughter: 'Figlio/a',
          spouse_cohabitant: 'Coniuge convivente',
        },
        assistableFrom: 'Assistibile dal',
        assistableTo: 'al',
      },
      show: {
        title: 'Dati prenotazione - Socio assistibile',
      },
      invoices: {
        title: 'Fatture',
        edit: 'Carica nuovo allegato',
        id: '#',
        file: 'File',
        filename: 'Nome file',
        number: 'Numero fattura',
        date: 'Data fattura',
        amount: 'Importo',
        type: 'Tipo',
        same_issuer: 'Emittente diverso dalla struttura?',
        vat_number: 'Partita IVA',
        fiscal_code: 'Codice fiscale',
        issuing_body: 'Ente emittente',
        types: {
          1: 'Acconto',
          2: 'Saldo',
          3: 'Storno',
        }
      },
      lendings: {
        title: 'Prestazioni',
        edit: 'Modifica prestazione',
        id: '#',
        name: 'Prestazione',
        current_price: 'Costo €',
        quantity: 'Quantità',
        executed_at: 'Eseguita il',
        iva: 'Aliquota IVA',
        prescription_at: 'Data prescrizione',
        applicable_from: 'Applicabile da',
        obligations_title: 'Obblighi',
        documents: {
          title: 'Documentazione richiesta',
          name: 'Codice prestazione',
          required: 'Documento richiesto'
        },
        obligations: {
          title: 'Documentazione',
          editTitle: 'Carica documento',
          filename: 'Documento',
          type: 'Tipo documento',
          file: 'File',
          types: {
            0: 'Altro',
            1: 'Radiografia',
            2: 'ECG',
          }
        }
      },
      summary_cost: {
        title: 'Riepilogo',
        id: 'Codice',
        name: 'Descrizione',
        current_price: 'Tariffa negoziata in vigore',
        quantity: 'Quantità',
        iva: 'Aliquota IVA',
        fund_cost: 'Tariffa di rimborso del Fondo',
        patient_cost: 'Totale a carico iscritto',
        structure_cost: 'Imponibile',
      },
      type: 'Regime di erogazione della prestazione',
      main_fiscal_code: 'Codice Fiscale iscritto principale',
      position: 'Numero fondo',
      name: 'Nome',
      surname: 'Cognome',
      fiscal_code: 'Codice fiscale',
      recovery_reason: 'Motivo ricovero',
      recovery_from: 'Ricovero da',
      recovery_to: 'Ricovero a',
      booking_at: 'Data prenotazione',
      booking_time: 'Ora prenotazione',
      lendings_total_cost: 'Totale Prestazioni',
      invoices_total_cost: 'Totale Fatture'
    },
    validation: {
      error: 'La prenotazione non è valida.',
      errorTitle: 'Attenzione',
      validatedTitle: 'Prenotazione approvata',
      validatedMessage: 'I dati inseriti sono pronti per essere trasmessi per le operazioni di liquidazione. Nel seguito e` possibile visualizzare il riepilogo dei costi. Si desidera erogare la richiesta?',
    }
  }
}
