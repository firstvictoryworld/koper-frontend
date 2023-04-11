<template>
  <v-container>
    <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="download" :loading=isDownloading >
        {{ $t('download') }} 
      </v-btn>

    <CardContainer class="mt-5" :title="$t('agreements.contract.title')">
      <h3 class="text-center"> ATTO DI CONVENZIONE DIRETTA</h3>

      <p class="text-center mt-5">
        tra FASCHIM <br />
        (Fondo di assistenza sanitaria per i lavoratori addetti all'industria chimica, chimico-farmaceutica, delle fibre
        chimiche e dei settori abrasivi, lubrificanti e GPL)<br />
        20149 Milano - Via Giovanni da Procida, 11 - Codice Fiscale: 97358180152<br />
        rappresentato dal Direttore
        STRUTTURA SANITARIA: <b>{{ usersStore?.userDetails?.structureBusinessName }}</b><br />
        Indirizzo: <b>{{ usersStore?.userDetails?.structureAddress }}</b>.
        <b>{{ usersStore?.userDetails?.structurePostalCode }} {{ usersStore?.userDetails?.structureCity }} {{
          usersStore?.userDetails?.structureProvince }} </b>
      </p>
      <hr class="mt-3">
      <h3 class="text-center mt-5"> Premesse Convenzione Diretta</h3>
      <p class="mt-3">a) FASCHIM è il Fondo sanitario integrativo del S.S.N. per i lavoratori addetti all'industria
        chimica, chimico-farmaceutica, delle fibre chimiche e dei settori, abrasivi, lubrificanti e GPL;</p>
      <p class="mt-3">b) FASCHIM agisce in favore dei propri iscritti e loro familiari, se iscritti, ed è una Associazione
        senza scopo di lucro;</p>
      <p class="mt-3">c) FASCHIM, con l'intento di migliorare i servizi resi ai propri iscritti ha deciso di convenzionare
        in forma diretta le Strutture sanitarie ritenute più idonee a livello qualitativo ed utili territorialmente per
        meglio assolvere alle proprie finalità istituzionali;</p>
      <p class="mt-3">d) FASCHIM è assolutamente libero, a propria discrezionalità, di approvare o meno le convenzioni in
        forma diretta;</p>
      <p class="mt-3">e) con forma diretta s'intende il rimborso da parte di FASCHIM alla Struttura sanitaria delle spese
        dalla stessa anticipate in favore degli iscritti/assistiti, in nome e per loro conto, nei limiti delle tariffe
        massime di rimborso e dei massimali previsti esposte nel Nomenclatore-Tariffario/Nomenclatore odontoiatrico e
        Regolamento di FASCHIM in vigore, e successive modifiche/integrazioni. Le eventuali eccedenze di spesa concordate
        in fase di convenzione sono sempre a carico degli iscritti/assistiti. La forma diretta si realizza unicamente
        quando è convenzionata la Struttura sanitaria; La fatturazione deve avvenire in periodo di assistibilità
        dell’iscritto che è garantita solo per il mese in cui viene verificata tramite l’apertura della prenotazione sul
        portale Koperniko (dato in uso alla Struttura per la gestione del convenzionamento diretto con FASCHIM).</p>
      <p class="mt-3">f) la presente convenzione ha per oggetto l'offerta in forma diretta delle prestazioni/servizi
        riconosciute/i come rimborsabili dal FASCHIM, nei limiti del nomenclatore-tariffario FASCHIM in vigore e
        successive modifiche/integrazioni, concordato per le eccedenze tariffarie;</p>
      <p class="mt-3">g) La struttura sanitaria/odontoiatrica è in possesso di regolare autorizzazione
        sanitaria/abilitazione per l’erogazione delle prestazioni oggetto della convenzione;</p>
      <p class="mt-3">h) I professionisti sanitari che collaborano con la struttura/struttura odontoiatrica che accede
        alla convenzione, sono tutti in possesso di regolare titolo di studio e/o iscritti ai rispettivi albi
        professionali. Nello specifico trattasi di personale medico e fisioterapisti, regolarmente abilitati all'esercizio
        professionale ed iscritti ai rispettivi ordini professionali. I medici-chirurghi che accettano il presente accordo
        di convenzione in forma diretta, i cui nominativi sono stati comunicati dalla Struttura sanitaria, sono tutti in
        possesso dei relativi titoli di specializzazione;</p>
      <p class="mt-3">i) FASCHIM non intrattiene alcun rapporto con i professionisti Medici-Chirurghi-Odontoiatri operanti
        presso la Struttura Sanitaria, per cui la stessa è responsabile del rispetto della presente convenzione, in
        particolare delle tariffe concordate e regole da seguire;</p>
      <p class="mt-3">l) per ragioni amministrative e informatiche, le Strutture Sanitarie nelle quali lavorano
        medici-chirurghi in regime di intramoenia devono possedere la delega all'incasso da parte delle Strutture
        Sanitarie Pubbliche con le quali intrattengono propri rapporti convenzionali oppure la deve possedere ogni
        medico-chirurgo. Le Strutture sanitarie s'impegnano ad incassare gli importi saldati dal FASCHIM comprese le
        eventuali eccedenze saldate in proprio dagli iscritti/assistiti e a trasferire le somme ricevute nel più breve
        tempo possibile alla Struttura sanitaria pubblica di competenza, come da accordi tra la Struttura Sanitaria stessa
        e la Struttura pubblica;</p>
      <p class="mt-3">m) le tariffe di rimborso descritte nel nomenclatore-tariffario FASCHIM in vigore e successive
        modifiche/integrazioni s'intendono sempre riferite al rimborso dell’intera procedura diagnostica, nel caso di
        visite e accertamenti, e al compenso dell’intera equipe medico chirurgica anestesiologica, nel caso di interventi
        chirurgici;</p>
      <p class="mt-3">n) eventuali aumenti o diminuzioni, negli anni, delle tariffe di rimborso da parte del FASCHIM non
        comporteranno una modifica delle tariffe concordate, bensì un'eventuale diminuzione o aumento delle eccedenze a
        carico degli iscritti /assistiti, salvo diversi accordi intrapresi tra le parti;</p>


      <p class="mt-3">o) FASCHIM non ammette che in una Struttura Sanitaria convenzionata con il Fondo si possano eseguire
        in forma indiretta prestazioni riconosciute e rimborsate in forma diretta da FASCHIM, anche se richiesto
        espressamente dagli assistiti; se ciò accadesse, FASCHIM può risolvere l'accordo immediatamente, senza preavviso.
        L'applicazione della forma indiretta può essere giustificata dalla posizione dell'iscritto non regolare, per tutte
        le prestazioni che risultano in stato BLOCCATA e RESPINTA fermo restando l’assistibilità dell’iscritto; nel caso
        di prestazioni che prevedono l’invio di fotografie che la struttura non è in grado di produrre, oppure di
        documenti richiesti come obblighi per l’erogazione della prestazione dal nomenclatore Tariffario in vigore
        all’atto della fatturazione, e che l’iscritto non fornisce prima di sottoporsi alla prestazione: solo in questi
        casi saranno gli iscritti a saldare le prestazioni e a chiedere il rimborso al Fondo;</p>
      <p class="mt-3">p) FASCHIM adotta la procedura di semplificazione documentale (dematerializzazione) in merito
        all'inoltro della documentazione contabile e all'assolvimento degli obblighi in ordine all'erogazione delle
        prestazioni secondo quanto previsto dal nomenclatore tariffario/nomenclatore odontoiatrico FASCHIM in vigore
        all’atto della fatturazione delle prestazioni. Resta inteso che solamente in caso di impossibilità di utilizzo del
        Portale per problemi tecnici informatici dello stesso è consentito l’inoltro in via cartacea;</p>

      <p class="mt-3">q) FASCHIM fornisce il portale KOPERNIKO in comodato d’uso gratuito per le strutture convenzionate
        con FASCHIM;</p>

      <p class="mt-3">r) FASCHIM adotta il modello di organizzazione, gestione e controllo e codice etico ex D. Lgs.
        231/01 e ha nominato un Organismo di Vigilanza ("OdV") </p>

      <p class="mt-3">s) il presente atto di convenzione è modificabile con espressa approvazione di entrambe le parti;
      </p>

      <p class="mt-3">t) nessuna delle pattuizioni contenute nel presente atto può essere considerata come obbligo di
        FASCHIM a procurare, sotto qualsiasi forma, clientela alla Struttura Sanitaria e/o Sigg.
        Medici-Chirurghi-Odontoiatri operanti presso la Struttura Sanitaria stessa;</p>

      <h3 class="mt-5"> Articoli Generali dell'Atto di Convenzione Diretta</h3>
      <h3 class="mt-5"> ARTICOLO 1 Premesse</h3>
      <p class="mt-3">Le premesse sono parte integrante dell’atto di convenzione. </p>

      <h3 class="mt-5">ARTICOLO 2 Segreto professionale e Privacy</h3>

      <p class="mt-3">La Struttura Sanitaria ed i Sigg. Medici-Chirurghi in virtù degli accordi tra FASCHIM ed i propri
        iscritti/assistiti, sono sciolti dal segreto professionale nei confronti di FASCHIM, di Generali Welion e W.C.S
        Wide Care Service, che gestiscono il sistema telematico e le liquidazioni, e dei consulenti medici ed hanno il
        consenso a trasmettere a FASCHIM, ai consulenti medici, a Generali Welion e W.C.S Wide Care Service i dati
        personali e sensibili degli iscritti/assistiti od aventi diritto.
        Le Parti si impegnano a rispettare le disposizioni di cui al D. Lgs 196/2003, integrato con le modifiche
        introdotte dal D. Lgs. 10 agosto 2018 n. 101 e del Reg. EU 2016/679 e, a tale scopo, si impegnano ad adottare ogni
        misura di sicurezza fisica, logistica ed organizzativa necessaria ed adeguata a garantire il rispetto
        dell’integrità ed esattezza dei dati personali trattati, nonché la liceità del loro trattamento. I dati potranno
        essere trattati esclusivamente nella misura strettamente necessaria alle attività da compiere ai sensi del
        Contratto.</p>


      <h3 class="mt-5"> ARTICOLO 3 Verifica requisiti strutturali ed auditing</h3>


      <p class="mt-3">a) FASCHIM si riserva la facoltà di effettuare visite ispettive, anche mediante suoi incaricati per
        verificare la sussistenza dei parametri tecnici-medici-amministrativi e di accoglienza dichiarati dalla Struttura
        che hanno determinato la proposta di convenzione e l'approvazione della stessa da parte di FASCHIM;</p>
      <p class="mt-3">b) FASCHIM si riserva il diritto di richiedere, per controlli a campione, l'originale/copia conforme
        all'originale delle fatture e dell'eventuale documentazione aggiuntiva.</p>

      <h3 class="mt-5"> ARTICOLO 4 Clausola di non esclusività</h3>

      <p class="mt-3">La presente convenzione non è in esclusiva né costituisce joint venture tra le Parti: pertanto
        FASCHIM ha la facoltà di stipulare analoghi accordi con altre Strutture Sanitarie; allo stesso modo anche la
        Struttura Sanitaria ha la facoltà di stipulare analoghi accordi con altri Fondi Sanitari Integrativi e/o Compagnie
        di assicurazione e/o altri Enti. </p>

      <h3 class="mt-5"> ARTICOLO 5 Interessi di mora</h3>

      <p class="mt-3">Le parti, ai sensi ed agli effetti di cui all'art. 5, comma 1 D. Lgs n° 231 del 9/10/2002, tenuto
        anche conto dei reciproci vantaggi loro derivanti dal complessivo assetto di interessi, regolato dalla presente
        convenzione, espressamente escludono, in caso di ritardo nei pagamenti dei corrispettivi, l'applicazione degli
        interessi di mora di cui alla direttiva europea 2000/35/CE del 29/06/2000 recepita dal predetto D. Lgs 231/02,
        ritenendo il creditore che tale esclusione non sia lesiva di tali interessi.</p>

      <h3 class="mt-5">ARTICOLO 6 Manleva</h3>

      <p class="mt-3">FASCHIM, in qualità di erogatore di servizi, è estraneo ad ogni e qualsivoglia rapporto che andrà ad
        intercorrere fra l'utilizzatore dei servizi/prestazioni e la Struttura Sanitaria e/o Medici-Chirurghi-Odontoiatri.
        Pertanto FASCHIM e/o W.C.S Wide Care Service e/o Generali Welion resteranno in ogni caso estranei a qualsiasi
        controversia tra le parti e comunque verranno tenuti dalla Struttura Sanitaria e/o dai
        Medici-Chirurghi-Odontoiatri e/o altri professionisti e/o personale paramedico e amministrativo integralmente ed
        incondizionatamente manlevati da ogni e qualsivoglia domanda e/o conseguenza mossa da terzi nei loro confronti;
      </p>
      <h3 class="mt-5">ARTICOLO 7 Foro competente</h3>

      <p class="mt-3">Per ogni controversia tra le parti sarà competente esclusivamente Il Foro di Milano.</p>


      <h3 class="mt-5 text-center">Obblighi della Struttura Sanitaria</h3>
      <h3 class="mt-5">ARTICOLO 8 Tariffe</h3>

      <p class="mt-3">a) l'accordo prevede l'applicazione di tariffe in favore degli assistiti che siano sempre e comunque
        inferiori al tariffario privato della Struttura sanitaria e dei medici-chirurghi di almeno il 15%, anche per le
        prestazioni non rimborsabili dal Fondo;</p>

      <p class="mt-3">b) la Struttura dovrà applicare in favore degli iscritti/assistiti le tariffe concordate e censite
        nella specifica area di Koperniko e denominate tariffa negoziata per tutte le prestazioni riconosciute come
        rimborsabili da FASCHIM; Se la Struttura sanitaria per ragioni commerciali od altre, anche se per un breve periodo
        di tempo, dovesse adottare tariffe private per alcune o tutte le prestazioni, inferiori a quelle concordate in
        questa convenzione, la stessa Struttura sanitaria ed i Professionisti sono obbligati inderogabilmente ad applicare
        per gli assistiti da FASCHIM le tariffe minori e più convenienti agli stessi e ad apportare immediatamente tali
        modifiche tariffarie all’interno di Koperniko in uso, ovvero alla tariffa negoziata concordata in questa
        convenzione;</p>
      <p class="mt-3">c) la Struttura dovrà modificare all'interno di Koperniko eventuali tariffe concordate che,
        confrontate, per singolo codice, con quelle del proprio tariffario privato, dovessero risultare superiori.
        Pertanto, gli iscritti/assistiti FASCHIM avranno sempre diritto all'applicazione della tariffa più conveniente ed
        inferiore;</p>

      <p class="mt-3">d) la Struttura dovrà anticipare in favore degli iscritti/assistiti FASCHIM che ne fanno richiesta,
        tutte le spese sanitarie sostenute nei limiti delle tariffe massime di rimborso FASCHIM previste dal
        Nomenclatore-Tariffario FASCHIM in vigore e successive modifiche/integrazioni;</p>


      <p class="mt-3">e) la Struttura dovrà farsi saldare dall'iscritto/assistito la quota totale dell'I.V.A. e del bollo
        risultante sia sulle somme riguardanti la quota a carico di FASCHIM che sull'eccedenza concordata e pagata in
        proprio dall'iscritto/assistito;</p>

      <p class="mt-3">f) la Struttura Sanitaria allega sul portale Koperniko, per tutte le prestazioni professionali ed i
        servizi svolti, il proprio tariffario privato, a comprova e garanzia che le tariffe concordate in questa
        convenzione siano sempre inferiori e vantaggiose per gli assistiti da FASCHIM;</p>

      <p class="mt-3">g) la Struttura Sanitaria dovrà assumersi ogni responsabilità per eventuali errori di calcolo
        nell'applicazione delle tariffe concordate nel presente accordo e per eventuali prestazioni erroneamente erogate a
        non aventi diritto per errata consultazione della posizione dell’iscritto, o per fatturazione di prestazioni
        caricate in periodo di copertura, ma fatturate con data di emissione oltre la cessazione del rapporto tra
        l’iscritto e Faschim. In tal caso eventuali importi anticipati dalla stessa Struttura sanitaria non rimarranno a
        carico di FASCHIM;</p>

      <p class="mt-3">h) gli iscritti/assistiti FASCHIM pagheranno in proprio alla Struttura Sanitaria eventuali eccedenze
        di spesa rispetto ai rimborsi FASCHIM, che sono state concordate e censite nel portale del Fondo in virtù del
        presente atto ed approvate da FASCHIM; le tariffe concordate con la Struttura Sanitaria sono esposte all'interno
        di Koperniko sotto la colonna denominata Tariffa Negoziata;</p>

      <p class="mt-3">i) la Struttura non deve richiedere agli assistiti FASCHIM alcun costo aggiuntivo per l'attuazione
        operativa delle procedure previste dalla convenzione in forma diretta per la pratica telematica e/o
        amministrativa;</p>
      <h3 class="mt-5">ARTICOLO 9 Prestazioni erogabili</h3>


      <p class="mt-3">La Struttura Sanitaria si obbliga ad offrire agli iscritti/assistiti FASCHIM unicamente le
        prestazioni consentite dalla propria autorizzazione sanitaria, attualmente in essere, di cui s'impegna a fornirne
        copia ed eventuali integrazioni/aggiornamenti. Inoltre, la Struttura Sanitaria si impegna a verificare che i
        Medici-Chirurghi che accettano il presente accordo di convenzione in forma diretta, comunicati dalla stessa, siano
        tutti in possesso dei relativi titoli di specializzazione. In mancanza nulla sarà dovuto da parte di FASCHIM.</p>
      <h3 class="mt-5"> ARTICOLO 11 Dematerializzazione fatture e riscontro telematico di alcuni obblighi amministrativi
      </h3>

      <p class="mt-3">a) la Struttura sanitaria dovrà garantire l'assoluta conformità tra le prestazioni inserite nella
        prenotazione PRESENTATA AL FONDO su Koperniko e quanto riscontrabile nella corrispondente fattura contabile che
        dovrà essere caricata a sistema tramite apposita funzione di upload.</p>

      <p class="mt-3">b) la Struttura sanitaria che dovesse erogare delle prestazioni soggette a limiti amministrativi si
        assume, con il riscontro telematico mediante la cosiddetta funzione di point & click, la veridicità delle
        dichiarazioni rese, ovvero al riscontro dell'esistenza degli obblighi per l’erogazione della prestazione, previsti
        dal Nomenclatore Tariffario in vigore all’atto della fatturazione, anche qualora non ne fosse richiesto il
        caricamento a sistema.</p>

      <h3 class="mt-5">ARTICOLO 12 Informativa all'assistito FASCHIM</h3>

      <p class="mt-3">a) la Struttura si impegna a fornire agli iscritti/assistiti FASCHIM, sempre, un preventivo di spesa
        di massima scritto prima di eseguire qualsiasi prestazione ove risulti la tariffa di rimborso di FASCHIM e
        l'eventuale tariffa/eccedenza a carico dell'iscritto/assistito; il preventivo deve essere completo
        dell'indicazione di eventuali prestazioni non rimborsabili da FASCHIM, ovvero mancanti sul nomenclatore/tariffario
        FASCHIM in vigore pro-tempore, i cui importi rimangono a totale carico dello stesso iscritto/assistito;</p>

      <p class="mt-3">b) E' compito della Struttura Sanitaria, in caso di sua disdetta della convenzione, darne immediata
        comunicazione ai pazienti iscritti/assistiti FASCHIM che si recassero presso la Struttura. E' altresì Suo compito
        chiudere le pratiche telematicamente ed emettere le fatture delle prestazioni eseguite fino alla data della
        disdetta.</p>

      <h3 class="mt-5">ARTICOLO 13 Comunicazioni a FASCHIM</h3>

      <p class="mt-3">a) La Struttura si impegna a informare tempestivamente il Fondo, con l'utilizzo degli strumenti
        telematici che il Fondo metterà a disposizione alle Strutture, qualsiasi variazione dovesse intervenire riguardo i
        propri dati identificativi e nell'ambito dei servizi/prestazioni offerte;</p>

      <p class="mt-3">b) la Struttura Sanitaria, in caso di momentaneo mal funzionamento del collegamento telematico,
        s'impegna ad avvertire /comunicare immediatamente il problema al Call Center di FASCHIM, per la soluzione dello
        stesso, ovviamente nei tempi più brevi possibili. Inoltre, la Struttura Sanitaria deve provvedere a darne
        immediata comunicazione anche agli iscritti/assistiti;</p>

      <h3 class="mt-5">ARTICOLO 14 Utilizzo degli applicativi informatici</h3>

      <p class="mt-3">La Struttura, prende atto che l'atto di convenzione si attua attraverso l'applicativo Koperniko, in
        licenza d'uso gratuito.</p>

      <h3 class="mt-5">ARTICOLO 15 Comunicazione, promozione ed uso del marchio</h3>
      <p class="mt-3">a) Le Parti convengono che, ai soli fini dell’esecuzione del Contratto, i marchi, loghi e segni
        distintivi di ciascuna di esse potranno essere associati a quelli dell’altra Parte. Tale facoltà potrà essere
        esercitata esclusivamente ove necessaria e per le sole attività inerenti all’oggetto del Contratto.</p>
      <p class="mt-3">b) Le Parti manterranno l’esclusiva titolarità dei marchi e segni distintivi utilizzati in
        esecuzione del Contratto di cui siano rispettivamente proprietari o licenziatari, senza che l’eventuale
        autorizzazione di una Parte all’altra all’utilizzo di detti marchi/segni distintivi possa in alcun modo essere
        inteso come licenza di marchio o far insorgere alcun diritto sul marchio e sui segni distintivi medesimi.</p>
      <p class="mt-3">c) Ciascuna Parte dichiara che i rispettivi marchi, unitamente ad eventuali messaggi pubblicitari
        agli stessi abbinati, non violano diritti di terzi, a qualsiasi titolo vantati, nel territorio degli Stati facenti
        parte dell’Unione Europea ivi compreso il territorio della Repubblica Italiana; non costituiscono violazione alla
      morale, all’ordine pubblico e al buon costume; non violano la normativa primaria e secondaria applicabile vigente
      ivi compresi i codici di autodisciplina interna (es. codice di autodisciplina pubblicitaria).</p>
    <p class="mt-3">d) FASCHIM autorizza la struttura ad inserire solamente il proprio nominativo e/o marchio sui propri
      mezzi di promozione e/o comunicazione e/o materiale divulgativo, ai soli fini di indicare l’adesione al
      convenzionamento con FASCHIM. Qualsiasi attività pubblicitaria e/o di comunicazione di qualsiasi tipo che esuli
      dalla mera comunicazione dell’esistenza del convenzionamento dovrà essere approvata per iscritto da parte di
      FASCHIM.</p>

    <h3 class="mt-5">ARTICOLO 16 Clausola 231</h3>

    <p class="mt-3">La struttura:</p>
    <p class="mt-3">a) dichiara, anche per i propri eventuali dipendenti, consulenti/lavoratori in somministrazione
      lavoro/collaboratori, di essere a conoscenza della normativa vigente in materia di responsabilità amministrativa
      della persona giuridica e, in particolare, del decreto legislativo 8 giugno 2001, n. 231 (il “D. Lgs. 231/2001”) e
      dei contenuti del Codice Etico disponibile sul Sito internet www.faschim.it;</p>
    <p class="mt-3">b) si impegna, anche per i propri eventuali dipendenti, consulenti/lavoratori in somministrazione
      lavoro/collaboratori che vengano in contatto con FASCHIM nell'esecuzione degli incarichi conferiti ad adempiere
      alle proprie obbligazioni derivanti dal Contratto nel rispetto dei principi di trasparenza e correttezza e delle
      previsioni contenute nel D. Lgs. 231/2001 e nel Codice Etico, per quanto allo stesso applicabili, così come di
      volta in volta modificati e/o aggiornati.</p>
    <p class="mt-3">c) dichiara che le richieste di rimborso presentate in relazione al Contratto saranno effettuate, in
      via esclusiva, in nome e per conto degli associati, saranno relative a prestazioni eseguite presso i centri
      medici/studi odontoiatrici ed i rimborsi percepiti non saranno neanche in parte utilizzati, a fini impropri o
      illeciti;</p>
    <p class="mt-3">d) si impegna, anche per i propri dipendenti, consulenti/lavoratori in somministrazione
      lavoro/collaboratori che vengano in contatto con FASCHIM ad informare tempestivamente il proprio referente in
      FASCHIM o l’Organismo di Vigilanza di FASCHIM, con propria comunicazione scritta da inviare in forma non anonima
      via e-mail all'indirizzo whistleblowing@faschim.it e ODV@faschim.it di qualsiasi atto, fatto o comportamento di
      cui venga a conoscenza, relativo alla commissione o presunta commissione di alcuno dei reati di cui al D. Lgs.
      231/2001 o alla violazione o presunta violazione delle disposizioni di cui al Codice Etico;</p>
    <p class="mt-3">e) si impegna ad osservare, nei confronti del proprio personale coinvolto nell’esecuzione del
      Contratto, la normativa vigente in materia di assicurazioni sociali e previdenziali, nonché ogni altra formalità e
      condizione correlata al rapporto di lavoro instaurato, prevista dall’ordinamento e dalla contrattazione collettiva
      applicabili; si impegna altresì a essere in regola con quanto disposto dal Testo Unico Immigrazione, anche in
      relazione alla presenza di permessi di soggiorno per i lavoratori stranieri alle sue dipendenze, manlevando
      FASCHIM da qualsiasi responsabilità che dovesse derivare dal mancato adempimento di tale obbligo;</p>

    <h3 class="mt-5">ARTICOLO 17 Surroga</h3>

    <p class="mt-3">Ogni qualvolta la Struttura Sanitaria riceverà un rimborso in base alla presente convenzione,
      FASCHIM sarà automaticamente surrogato a norma degli articoli 1201 e seguenti del Codice Civile in tutti i diritti
      della Struttura Sanitaria e/o iscritto/assistito verso terzi, nessuno escluso, compresi i privilegi spettanti a
      norma di legge.</p>
     
    <h3 class="mt-5 text-center">Obblighi di FASCHIM</h3>

    <h3 class="mt-5">ARTICOLO 18 PAGAMENTI</h3>

    <p class="mt-3">FASCHIM rimborserà alla Struttura Sanitaria convenzionata per le pratiche complete e correttamente
      istruite, in nome e per conto dei propri iscritti/assistiti, l'importo delle sole prestazioni autorizzate
      telematicamente, anticipato dalla Struttura Sanitaria medesima, nei limiti di quanto esposto nel
      Nomenclatore-Tariffario FASCHIM in vigore all’atto della fatturazione e successive modifiche/integrazioni, di
      norma, entro 30 giorni (trenta) dal ricevimento del flusso telematico di spesa, delle documentazioni sanitarie,
      delle fatture e degli allegati ove richiesti.</p>

    <h3 class="mt-5">ARTICOLO 19 Informativa agli assistiti</h3>

    <p class="mt-3">FASCHIM pubblicherà tempestivamente e comunque non prima della definitiva approvazione della
      convenzione, sul proprio sito internet www.faschim.it l'elenco delle Strutture convenzionate, le prestazioni
      usufruibili presso le stesse, le principali caratteristiche della Struttura compresa la geolocalizzazione e se
      effettua alcune prestazioni particolari (ad esempio la prevenzione o la forma diretta anche per il Ticket).</p>


    <h3 class="mt-5 text-center">Durata dell'Iniziativa</h3>

    <h3 class="mt-5">ARTICOLO 20 DURATA</h3>

    <p class="mt-3">La presente convenzione diretta ha validità, previa sottoscrizione mediante utilizzo della funzione
      di point & click, dal 23/03/2023 (e comunque non prima della data di attivazione del sistema Koperniko) e prevede
      il tacito rinnovo annuale.</p>

    <h3 class="mt-5">ARTICOLO 21 DISDETTA</h3>

    <p class="mt-3">Le parti si riservano la facoltà di recedere dalla presente convenzione con preavviso di 30 giorni.
    </p>
    <p>La disdetta formulata dalla struttura dovrà essere inviata a Faschim tramite posta certificata all’indirizzo
      (faschim@pec.it) oppure con qualsiasi mezzo che ne comprovi la ricezione, previa chiusura di tutte le prenotazioni
      eventualmente ancora aperte nell’area pratiche.</p>
    <p>La disdetta formulata da Faschim verrà inviata alla struttura sanitaria agli indirizzi indicati dalla struttura
      nella banca dati del fondo con ogni mezzo che ne comprovi la ricezione.</p>

    <hr class="mt-3">
    <h3 class="mt-5 text-center">Adesione all'Iniziativa</h3>
    <h3 class="mt-5 text-center">ADESIONE AL CONVENZIONAMENTO e/o AI SERVIZI FASCHIM</h3>


    <p class="mt-3">Ai sensi ed agli effetti degli artt. 1341 e 1342 cod. civ. i contraenti dichiarano di aver letto ed
      approvato tutti gli articoli della presente convenzione ed in particolare l'art. 6 (manleva) , l’art 8 (tariffe),
      l'art. 21 (disdetta), l'art. 17 (surroga) e l'art. 7 (foro competente)</p>


    <p class="mt-3">Adesione al CONVENZIONAMENTO FASCHIM: SI’</p>


    <p class="mt-3">Data di validazione: {{date.valid_from }}</p>
    <p class="mt-3">Data di Emissione: {{ date.subscribed_at }}</p>
    <p v-if="date.closed_at" class="mt-3">Data di Chiusura: {{ date.closed_at }}</p>
    <p class="mt-3">il Direttore FASCHIM Claudio Giammatteo </p>



    <v-divider />

    <v-checkbox :label="$t('agreements.contract.checkbox')" hide-details="auto" color="koperniko-secondary"
      variant="outlined" density="compact" v-model="contract.accepted"
      :disabled="contract.disabled" />
    <v-btn :disabled="contract.disabled" class="d-block ml-auto" size="large" color="koperniko-primary"
      :loading="isLoading" @click="() => subscribe()">
      {{ $t('confirm') }}
    </v-btn>

  </CardContainer>
</v-container></template>


<script setup lang="ts">
import AgreementStatusEnum from '@/enums/AgreementStatusEnum'
import { computed, inject, onMounted, reactive } from 'vue'
import CardContainer from '../common/CardContainer.vue'
import { useUsersStore } from '@/stores/users'
import { useToggle } from '@vueuse/shared'
import { axiosInjectKey } from '@/utils/axios'
import JsFileDownloader from 'js-file-downloader'

const usersStore = useUsersStore()
const [isLoading, toggleLoading] = useToggle(false)
const $axios = inject(axiosInjectKey)

const [isDownloading, toggleDownload] = useToggle()

const contract = reactive({
  accepted: false,
  disabled: true,
  
})

const agreement = reactive({
  id: undefined || null,
})

const date = reactive({
  subscribed_at: null,
  updated_at: null,
  valid_from: null,
  closed_at: null
})

const subscribe = async () => {
  toggleLoading()

  await $axios?.put(`/agreements/subscribeExistentAgreement`)
    .then(({ data }) => {
      const { status } = data.agreement
      contract.disabled = true
    })
    .catch(console.error)

  toggleLoading()
}

const confirmation = async () => {
  toggleLoading()

  await $axios?.get(`/agreements/getExistentAgreement`)
    .then(({ data }) => {
      const { subscribed_at, valid_from, closed_at } = data.agreement
      agreement.id = data.agreement.id
      date.valid_from = valid_from
      date.subscribed_at = subscribed_at
      date.closed_at = closed_at
      if (subscribed_at != null && closed_at === null) {  contract.accepted = true; contract.disabled = true }
    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  confirmation()
})

const download = async () => {
  toggleDownload()

  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/agreements/${agreement.id}/download`

  await new JsFileDownloader({
      url,
      filename: `atti_di_convenzionamento.pdf`,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: usersStore.bearerToken }
      ],
    })
    .catch(console.error)

  toggleDownload()
}

</script>