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
      2: 'Approvata',
      3: 'Bloccata',
      4: 'Respinta',
      5: 'Integrata',
      6: 'Conclusa',
      7: 'Sospesa',
      8: 'Presentata al fondo',
      9: 'In Revisione'
    },
    errors: {
      missingDoc: 'Attenzione, documentazione mancante!',
      missingDocs: 'Attenzione, uno o più documenti richiesti non sono stati caricati!',
      missingLending: 'Attenzione, nessuna prestazione inserita.'
    },
    list: {
      id: '#',
      checkbox: '',
      number: 'Numero',
      type: 'Tipo',
      stato: 'Stato',
      position: 'Posizione',
      nominative: 'Nominativo',
      status: 'Status',
      fiscal_code: 'Codice fiscale',
      structure: 'Struttura',
      created_at: 'Data Apertura'
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
        assistableTo: 'al'
      },
      show: {
        title: 'Dati prenotazione - Socio assistibile',
      },
      messageBookingType: 'Per proseguire con la Prenotazione si prega di selezionare il Regime di Erogazione e Confermare',
      invoices: {
        title: 'Fatture',
        edit: 'Carica nuovo allegato',
        id: '#',
        file: 'File',
        filename: 'Nome file',
        number: 'Numero fattura',
        date: 'Data fattura',
        amount: 'Importo €',
        stamp: 'Bollo €',
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
      obligations: {
        title: 'Documentazione',
        editTitle: 'Carica documento',
        name: 'Nome',
        lendings: 'Prestazioni di riferimento',
        required: 'Obbligatorio',
        type_obligation: 'Tipo documento',
        file: 'File',
        types: {
          0: 'Altro',
          1: 'Radiografia',
          2: 'ECG',
        },
        noDescription: 'Non sono presenti ulteriori informazioni'
      },
      lendings: {
        title: 'Prestazioni',
        edit: 'Modifica prestazione',
        // id: '#',
        checkbox: 'Primaria',
        fund_code: 'Codice',
        name: 'Prestazione',
        current_price: 'Costo €',
        quantity: 'Quantità',
        executed_at: 'Eseguita il',
        iva: 'Aliquota IVA',
        prescription_at: 'Data prescrizione',
        applicable_from: 'Applicabile da',
        obligations_title: 'Obblighi',
        primary: 'Primaria',
        pregnancy: 'Soggetto in gravidanza',
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
        fund_code: 'Codice',
        name: 'Descrizione',
        unit_amount: 'Tariffa negoziata in vigore €',
        quantity: 'Qtà',
        net_amount: 'Imponibile €',
        tax_percentage: 'IVA %',
        total_amount: 'Importo totale prestazione €',
        patient_amount: 'Importo a carico Iscritto €',
        refund_amount: 'Rimborso dal Fondo €',
      },
      summary_totals: {
        total: 'Importo totale prestazione',
        refund: 'Rimborso totale dal Fondo',
        patient: 'Importo totale a carico dell\'Iscritto',
      },
      type: 'Regime di erogazione',
      main_fiscal_code: 'Codice Fiscale di chi deve eseguire la prestazione',
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
    },
    deliver: {
      error: 'La prenotazione non è valida.',
      errorTitle: 'Attenzione',
    }
  }
}
