/**
 * Comprehensive Pharmaceutical Directory & Fast Prefix Search
 * Provides instantaneous, zero-latency drug prefix filtering and elimination,
 * matching generic names, verified brand names, and drug classes.
 */

export interface DrugDirectoryEntry {
  name: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  rxcui?: string;
  matchedOn?: 'generic' | 'brand' | 'phonetic' | 'fuzzy';
  matchedTerm?: string;
  isFuzzyCorrection?: boolean;
  similarityScore?: number;
}

export const DRUG_DIRECTORY: DrugDirectoryEntry[] = [
  // A
  { name: 'Abacavir', genericName: 'Abacavir', brandNames: ['Ziagen'], drugClass: 'Nucleoside reverse transcriptase inhibitor (NRTI)', rxcui: '190521' },
  { name: 'Abemaciclib', genericName: 'Abemaciclib', brandNames: ['Verzenio'], drugClass: 'CDK4/6 inhibitor antineoplastic', rxcui: '1946825' },
  { name: 'Abiraterone', genericName: 'Abiraterone', brandNames: ['Zytiga'], drugClass: 'CYP17A1 inhibitor / Antiandrogen', rxcui: '1100699' },
  { name: 'Acalabrutinib', genericName: 'Acalabrutinib', brandNames: ['Calquence'], drugClass: 'Bruton tyrosine kinase (BTK) inhibitor', rxcui: '1992928' },
  { name: 'Acetaminophen', genericName: 'Acetaminophen', brandNames: ['Tylenol', 'Panadol', 'Paracetamol'], drugClass: 'Central analgesic and antipyretic', rxcui: '161' },
  { name: 'Acetazolamide', genericName: 'Acetazolamide', brandNames: ['Diamox'], drugClass: 'Carbonic anhydrase inhibitor', rxcui: '167' },
  { name: 'Acyclovir', genericName: 'Acyclovir', brandNames: ['Zovirax'], drugClass: 'Guanosine analogue antiviral', rxcui: '281' },
  { name: 'Adalimumab', genericName: 'Adalimumab', brandNames: ['Humira'], drugClass: 'Anti-TNF-alpha monoclonal antibody', rxcui: '327361' },
  { name: 'Albuterol', genericName: 'Albuterol', brandNames: ['Ventolin', 'ProAir', 'Proventil'], drugClass: 'Beta-2 adrenergic bronchodilator', rxcui: '435' },
  { name: 'Alendronate', genericName: 'Alendronate', brandNames: ['Fosamax'], drugClass: 'Bisphosphonate bone resorption inhibitor', rxcui: '3750' },
  { name: 'Allopurinol', genericName: 'Allopurinol', brandNames: ['Zyloprim'], drugClass: 'Xanthine oxidase inhibitor', rxcui: '519' },
  { name: 'Alprazolam', genericName: 'Alprazolam', brandNames: ['Xanax'], drugClass: 'Benzodiazepine anxiolytic', rxcui: '596' },
  { name: 'Amiodarone', genericName: 'Amiodarone', brandNames: ['Pacerone', 'Cordarone'], drugClass: 'Class III antiarrhythmic', rxcui: '703' },
  { name: 'Amitriptyline', genericName: 'Amitriptyline', brandNames: ['Elavil'], drugClass: 'Tricyclic antidepressant', rxcui: '704' },
  { name: 'Amlodipine', genericName: 'Amlodipine', brandNames: ['Norvasc'], drugClass: 'Dihydropyridine calcium channel blocker', rxcui: '17767' },
  { name: 'Amoxicillin', genericName: 'Amoxicillin', brandNames: ['Amoxil', 'Trimox'], drugClass: 'Aminopenicillin antibiotic', rxcui: '723' },
  { name: 'Amphotericin B', genericName: 'Amphotericin B', brandNames: ['Fungizone', 'AmBisome'], drugClass: 'Polyene antifungal antibiotic', rxcui: '747' },
  { name: 'Ampicillin', genericName: 'Ampicillin', brandNames: ['Principen'], drugClass: 'Aminopenicillin antibiotic', rxcui: '764' },
  { name: 'Anastrozole', genericName: 'Anastrozole', brandNames: ['Arimidex'], drugClass: 'Aromatase inhibitor antineoplastic', rxcui: '84857' },
  { name: 'Apalutamide', genericName: 'Apalutamide', brandNames: ['Erleada'], drugClass: 'Androgen receptor inhibitor', rxcui: '2001357' },
  { name: 'Apixaban', genericName: 'Apixaban', brandNames: ['Eliquis'], drugClass: 'Factor Xa direct oral anticoagulant', rxcui: '1364430' },
  { name: 'Aprepitant', genericName: 'Aprepitant', brandNames: ['Emend'], drugClass: 'Substance P / Neurokinin-1 antagonist', rxcui: '358263' },
  { name: 'Aripiprazole', genericName: 'Aripiprazole', brandNames: ['Abilify'], drugClass: 'Atypical antipsychotic D2 partial agonist', rxcui: '89013' },
  { name: 'Artemether', genericName: 'Artemether', brandNames: ['Coartem'], drugClass: 'Artemisinin antimalarial', rxcui: '28670' },
  { name: 'Artesunate', genericName: 'Artesunate', brandNames: ['Artesun'], drugClass: 'Semisynthetic artemisinin antimalarial', rxcui: '88249' },
  { name: 'Aspirin', genericName: 'Aspirin', brandNames: ['Bayer', 'Ecotrin', 'Bufferin'], drugClass: 'NSAID / Antiplatelet cyclooxygenase inhibitor', rxcui: '1191' },
  { name: 'Atazanavir', genericName: 'Atazanavir', brandNames: ['Reyataz'], drugClass: 'HIV-1 azapeptide protease inhibitor', rxcui: '343047' },
  { name: 'Atenolol', genericName: 'Atenolol', brandNames: ['Tenormin'], drugClass: 'Beta-1 selective adrenergic blocker', rxcui: '1202' },
  { name: 'Atomoxetine', genericName: 'Atomoxetine', brandNames: ['Strattera'], drugClass: 'Selective norepinephrine reuptake inhibitor', rxcui: '351275' },
  { name: 'Atorvastatin', genericName: 'Atorvastatin', brandNames: ['Lipitor'], drugClass: 'HMG-CoA reductase inhibitor (Statin)', rxcui: '83367' },
  { name: 'Atovaquone', genericName: 'Atovaquone', brandNames: ['Mepron', 'Malarone'], drugClass: 'Hydroxynaphthoquinone antiprotozoal', rxcui: '40048' },
  { name: 'Azacitidine', genericName: 'Azacitidine', brandNames: ['Vidaza', 'Onureg'], drugClass: 'DNA methyltransferase inhibitor antineoplastic', rxcui: '1254' },
  { name: 'Azathioprine', genericName: 'Azathioprine', brandNames: ['Imuran', 'Azasan'], drugClass: 'Purine antimetabolite immunosuppressant', rxcui: '1256' },
  { name: 'Azelaic Acid', genericName: 'Azelaic Acid', brandNames: ['Azelex', 'Finacea'], drugClass: 'Dicarboxylic acid dermatologic antimicrobial', rxcui: '1302' },
  { name: 'Azelastine', genericName: 'Azelastine', brandNames: ['Astelin', 'Astepro'], drugClass: 'Second-generation H1 receptor antihistamine', rxcui: '1304' },
  { name: 'Azilsartan', genericName: 'Azilsartan', brandNames: ['Edarbi'], drugClass: 'Angiotensin II receptor blocker (ARB)', rxcui: '1091383' },
  { name: 'Azithromycin', genericName: 'Azithromycin', brandNames: ['Zithromax', 'Zmax'], drugClass: 'Macrolide antibiotic', rxcui: '18631' },
  { name: 'Aztreonam', genericName: 'Aztreonam', brandNames: ['Cayston', 'Azactam'], drugClass: 'Monobactam beta-lactam antibiotic', rxcui: '1273' },

  // B
  { name: 'Baclofen', genericName: 'Baclofen', brandNames: ['Lioresal', 'Gablofen'], drugClass: 'GABA-B receptor agonist muscle relaxant', rxcui: '1292' },
  { name: 'Baloxavir Marboxil', genericName: 'Baloxavir Marboxil', brandNames: ['Xofluza'], drugClass: 'Cap-dependent endonuclease influenza antiviral', rxcui: '2099951' },
  { name: 'Baricitinib', genericName: 'Baricitinib', brandNames: ['Olumiant'], drugClass: 'JAK1 and JAK2 kinase inhibitor', rxcui: '2001402' },
  { name: 'Bedaquiline', genericName: 'Bedaquiline', brandNames: ['Sirturo'], drugClass: 'Mycobacterial ATP synthase inhibitor', rxcui: '1359331' },
  { name: 'Benazepril', genericName: 'Benazepril', brandNames: ['Lotensin'], drugClass: 'Angiotensin-converting enzyme (ACE) inhibitor', rxcui: '1399' },
  { name: 'Bendamustine', genericName: 'Bendamustine', brandNames: ['Treanda', 'Bendeka'], drugClass: 'Bifunctional mechlorethamine alkylating agent', rxcui: '134547' },
  { name: 'Benzonatate', genericName: 'Benzonatate', brandNames: ['Tessalon Perles'], drugClass: 'Non-narcotic stretch receptor antitussive', rxcui: '1431' },
  { name: 'Bicalutamide', genericName: 'Bicalutamide', brandNames: ['Casodex'], drugClass: 'Non-steroidal androgen receptor antagonist', rxcui: '72962' },
  { name: 'Bictegravir', genericName: 'Bictegravir', brandNames: ['Biktarvy'], drugClass: 'HIV integrase strand transfer inhibitor', rxcui: '2002360' },
  { name: 'Binimetinib', genericName: 'Binimetinib', brandNames: ['Mektovi'], drugClass: 'MEK1 and MEK2 kinase inhibitor', rxcui: '2049100' },
  { name: 'Bisoprolol', genericName: 'Bisoprolol', brandNames: ['Zebeta'], drugClass: 'Cardioselective beta-1 adrenergic blocker', rxcui: '19484' },
  { name: 'Bortezomib', genericName: 'Bortezomib', brandNames: ['Velcade'], drugClass: 'Reversible 26S proteasome inhibitor', rxcui: '358262' },
  { name: 'Bosentan', genericName: 'Bosentan', brandNames: ['Tracleer'], drugClass: 'Dual endothelin receptor antagonist (ERA)', rxcui: '119565' },
  { name: 'Bosutinib', genericName: 'Bosutinib', brandNames: ['Bosulif'], drugClass: 'BCR-ABL and SRC tyrosine kinase inhibitor', rxcui: '1306380' },
  { name: 'Budesonide', genericName: 'Budesonide', brandNames: ['Pulmicort', 'Entocort EC', 'Uceris'], drugClass: 'Glucocorticoid anti-inflammatory', rxcui: '19831' },
  { name: 'Bumetanide', genericName: 'Bumetanide', brandNames: ['Bumex'], drugClass: 'Loop diuretic sulfonamide', rxcui: '1808' },
  { name: 'Buprenorphine', genericName: 'Buprenorphine', brandNames: ['Subutex', 'Suboxone', 'Butrans'], drugClass: 'Partial mu-opioid receptor agonist', rxcui: '1819' },
  { name: 'Bupropion', genericName: 'Bupropion', brandNames: ['Wellbutrin', 'Zyban', 'Aplenzin'], drugClass: 'Norepinephrine-dopamine reuptake inhibitor (NDRI)', rxcui: '42347' },
  { name: 'Buspirone', genericName: 'Buspirone', brandNames: ['Buspar'], drugClass: 'Azaspirodecanedione 5-HT1A partial agonist', rxcui: '1827' },

  // C
  { name: 'Cabazitaxel', genericName: 'Cabazitaxel', brandNames: ['Jevtana'], drugClass: 'Semisynthetic taxoid microtubule stabilizer', rxcui: '1009145' },
  { name: 'Cabozantinib', genericName: 'Cabozantinib', brandNames: ['Cabometyx', 'Cometriq'], drugClass: 'Multikinase MET and VEGFR2 inhibitor', rxcui: '1359133' },
  { name: 'Canagliflozin', genericName: 'Canagliflozin', brandNames: ['Invokana'], drugClass: 'Sodium-glucose cotransporter-2 (SGLT2) inhibitor', rxcui: '1373458' },
  { name: 'Candesartan', genericName: 'Candesartan', brandNames: ['Atacand'], drugClass: 'Angiotensin II receptor antagonist (ARB)', rxcui: '214354' },
  { name: 'Capecitabine', genericName: 'Capecitabine', brandNames: ['Xeloda'], drugClass: 'Fluoropyrimidine carbamate prodrug (5-FU)', rxcui: '187832' },
  { name: 'Captopril', genericName: 'Captopril', brandNames: ['Capoten'], drugClass: 'Angiotensin-converting enzyme (ACE) inhibitor', rxcui: '1998' },
  { name: 'Carbamazepine', genericName: 'Carbamazepine', brandNames: ['Tegretol', 'Carbatrol'], drugClass: 'Voltage-gated sodium channel anticonvulsant', rxcui: '2002' },
  { name: 'Carbidopa', genericName: 'Carbidopa', brandNames: ['Lodosyn', 'Sinemet'], drugClass: 'Aromatic L-amino acid decarboxylase inhibitor', rxcui: '2008' },
  { name: 'Carboplatin', genericName: 'Carboplatin', brandNames: ['Paraplatin'], drugClass: 'Platinum-based DNA cross-linking antineoplastic', rxcui: '2019' },
  { name: 'Carfilzomib', genericName: 'Carfilzomib', brandNames: ['Kyprolis'], drugClass: 'Epoxyketone proteasome inhibitor', rxcui: '1302868' },
  { name: 'Carvedilol', genericName: 'Carvedilol', brandNames: ['Coreg'], drugClass: 'Non-selective beta and alpha-1 adrenergic blocker', rxcui: '20352' },
  { name: 'Caspofungin', genericName: 'Caspofungin', brandNames: ['Cancidas'], drugClass: 'Echinocandin 1,3-beta-D-glucan synthase inhibitor', rxcui: '277490' },
  { name: 'Cefazolin', genericName: 'Cefazolin', brandNames: ['Ancef', 'Kefzol'], drugClass: 'First-generation cephalosporin antibiotic', rxcui: '2180' },
  { name: 'Cefdinir', genericName: 'Cefdinir', brandNames: ['Omnicef'], drugClass: 'Third-generation cephalosporin antibiotic', rxcui: '40049' },
  { name: 'Cefepime', genericName: 'Cefepime', brandNames: ['Maxipime'], drugClass: 'Fourth-generation broad-spectrum cephalosporin', rxcui: '25480' },
  { name: 'Ceftriaxone', genericName: 'Ceftriaxone', brandNames: ['Rocephin'], drugClass: 'Third-generation cephalosporin antibiotic', rxcui: '2193' },
  { name: 'Cefuroxime', genericName: 'Cefuroxime', brandNames: ['Ceftin', 'Zinacef'], drugClass: 'Second-generation cephalosporin antibiotic', rxcui: '2194' },
  { name: 'Celecoxib', genericName: 'Celecoxib', brandNames: ['Celebrex'], drugClass: 'Selective COX-2 inhibitor NSAID', rxcui: '214199' },
  { name: 'Cephalexin', genericName: 'Cephalexin', brandNames: ['Keflex'], drugClass: 'First-generation cephalosporin antibiotic', rxcui: '2231' },
  { name: 'Cetirizine', genericName: 'Cetirizine', brandNames: ['Zyrtec'], drugClass: 'Second-generation H1 receptor antihistamine', rxcui: '20610' },
  { name: 'Chloroquine', genericName: 'Chloroquine', brandNames: ['Aralen'], drugClass: '4-Aminoquinoline antimalarial and amebicide', rxcui: '2353' },
  { name: 'Chlorthalidone', genericName: 'Chlorthalidone', brandNames: ['Hygroton', 'Thalitone'], drugClass: 'Thiazide-like diuretic', rxcui: '2403' },
  { name: 'Ciprofloxacin', genericName: 'Ciprofloxacin', brandNames: ['Cipro'], drugClass: 'Fluoroquinolone DNA gyrase inhibitor', rxcui: '2551' },
  { name: 'Cisplatin', genericName: 'Cisplatin', brandNames: ['Platinol'], drugClass: 'Platinum-based DNA cross-linking antineoplastic', rxcui: '2555' },
  { name: 'Citalopram', genericName: 'Citalopram', brandNames: ['Celexa'], drugClass: 'Selective serotonin reuptake inhibitor (SSRI)', rxcui: '2556' },
  { name: 'Clarithromycin', genericName: 'Clarithromycin', brandNames: ['Biaxin'], drugClass: 'Macrolide antibiotic protein synthesis inhibitor', rxcui: '21212' },
  { name: 'Clindamycin', genericName: 'Clindamycin', brandNames: ['Cleocin'], drugClass: 'Lincosamide 50S ribosomal antibiotic', rxcui: '2582' },
  { name: 'Clobetasol', genericName: 'Clobetasol', brandNames: ['Temovate', 'Clobex'], drugClass: 'Super-potent synthetic topical corticosteroid', rxcui: '2604' },
  { name: 'Clomiphene', genericName: 'Clomiphene', brandNames: ['Clomid', 'Serophene'], drugClass: 'Selective estrogen receptor modulator (SERM)', rxcui: '2623' },
  { name: 'Clonazepam', genericName: 'Clonazepam', brandNames: ['Klonopin'], drugClass: 'Long-acting benzodiazepine anticonvulsant', rxcui: '2598' },
  { name: 'Clonidine', genericName: 'Clonidine', brandNames: ['Catapres', 'Kapvay'], drugClass: 'Centrally acting alpha-2 adrenergic agonist', rxcui: '2599' },
  { name: 'Clopidogrel', genericName: 'Clopidogrel', brandNames: ['Plavix'], drugClass: 'Thienopyridine P2Y12 platelet inhibitor', rxcui: '32968' },
  { name: 'Clozapine', genericName: 'Clozapine', brandNames: ['Clozaril', 'Fazaclo'], drugClass: 'Atypical dibenzodiazepine antipsychotic', rxcui: '2626' },
  { name: 'Colchicine', genericName: 'Colchicine', brandNames: ['Colcrys', 'Mitigare'], drugClass: 'Tubulin polymerization inhibitor alkaloid', rxcui: '2683' },
  { name: 'Colistin', genericName: 'Colistin', brandNames: ['Coly-Mycin M'], drugClass: 'Polymyxin cell membrane disruptor antibiotic', rxcui: '2698' },
  { name: 'Crizotinib', genericName: 'Crizotinib', brandNames: ['Xalkori'], drugClass: 'Receptor tyrosine kinase ALK and ROS1 inhibitor', rxcui: '1147220' },
  { name: 'Cyclobenzaprine', genericName: 'Cyclobenzaprine', brandNames: ['Flexeril', 'Amrix'], drugClass: 'Centrally acting skeletal muscle relaxant', rxcui: '3008' },
  { name: 'Cyclophosphamide', genericName: 'Cyclophosphamide', brandNames: ['Cytoxan'], drugClass: 'Nitrogen mustard oxazaphosphorine alkylating agent', rxcui: '3002' },
  { name: 'Cyclosporine', genericName: 'Cyclosporine', brandNames: ['Neoral', 'Sandimmune', 'Restasis'], drugClass: 'Calcineurin phosphatase inhibitor', rxcui: '3008' },

  // D
  { name: 'Dabigatran', genericName: 'Dabigatran', brandNames: ['Pradaxa'], drugClass: 'Direct reversible thrombin (Factor IIa) inhibitor', rxcui: '1037042' },
  { name: 'Dabrafenib', genericName: 'Dabrafenib', brandNames: ['Tafinlar'], drugClass: 'BRAF V600 mutation-selective kinase inhibitor', rxcui: '1419754' },
  { name: 'Dapsone', genericName: 'Dapsone', brandNames: ['Aczone'], drugClass: 'Sulfone dihydropteroate synthase inhibitor', rxcui: '3138' },
  { name: 'Daptomycin', genericName: 'Daptomycin', brandNames: ['Cubicin'], drugClass: 'Cyclic lipopeptide bactericidal antibiotic', rxcui: '152771' },
  { name: 'Darunavir', genericName: 'Darunavir', brandNames: ['Prezista'], drugClass: 'Second-generation non-peptidic HIV protease inhibitor', rxcui: '617565' },
  { name: 'Dasatinib', genericName: 'Dasatinib', brandNames: ['Sprycel'], drugClass: 'BCR-ABL and SRC family kinase inhibitor', rxcui: '643067' },
  { name: 'Dexamethasone', genericName: 'Dexamethasone', brandNames: ['Decadron', 'DexPak'], drugClass: 'Potent glucocorticoid corticosteroid', rxcui: '3264' },
  { name: 'Dexmethylphenidate', genericName: 'Dexmethylphenidate', brandNames: ['Focalin'], drugClass: 'CNS stimulant d-threo-methylphenidate', rxcui: '351259' },
  { name: 'Diazepam', genericName: 'Diazepam', brandNames: ['Valium', 'Diastat'], drugClass: 'Long-acting benzodiazepine GABA-A positive modulator', rxcui: '3322' },
  { name: 'Diclofenac', genericName: 'Diclofenac', brandNames: ['Voltaren', 'Cataflam'], drugClass: 'Phenylacetic acid derivative NSAID', rxcui: '3355' },
  { name: 'Dicyclomine', genericName: 'Dicyclomine', brandNames: ['Bentyl'], drugClass: 'Antispasmodic muscarinic anticholinergic', rxcui: '3356' },
  { name: 'Digoxin', genericName: 'Digoxin', brandNames: ['Lanoxin', 'Digitek'], drugClass: 'Cardiac glycoside Na+/K+ ATPase inhibitor', rxcui: '3407' },
  { name: 'Diltiazem', genericName: 'Diltiazem', brandNames: ['Cardizem', 'Tiazac', 'Cartia XT'], drugClass: 'Benzothiazepine non-dihydropyridine calcium blocker', rxcui: '3443' },
  { name: 'Diphenhydramine', genericName: 'Diphenhydramine', brandNames: ['Benadryl'], drugClass: 'First-generation ethanolamine H1 antihistamine', rxcui: '3498' },
  { name: 'Docetaxel', genericName: 'Docetaxel', brandNames: ['Taxotere'], drugClass: 'Semisynthetic taxane microtubule stabilizer', rxcui: '36041' },
  { name: 'Dofetilide', genericName: 'Dofetilide', brandNames: ['Tikosyn'], drugClass: 'Class III antiarrhythmic rapid delayed rectifier potassium blocker', rxcui: '43370' },
  { name: 'Dolutegravir', genericName: 'Dolutegravir', brandNames: ['Tivicay'], drugClass: 'Second-generation HIV integrase strand transfer inhibitor', rxcui: '1433868' },
  { name: 'Donepezil', genericName: 'Donepezil', brandNames: ['Aricept'], drugClass: 'Reversible acetylcholinesterase inhibitor', rxcui: '72236' },
  { name: 'Doxazosin', genericName: 'Doxazosin', brandNames: ['Cardura'], drugClass: 'Quinazoline selective alpha-1 adrenergic blocker', rxcui: '3616' },
  { name: 'Doxorubicin', genericName: 'Doxorubicin', brandNames: ['Adriamycin', 'Doxil'], drugClass: 'Anthracycline topoisomerase II intercalator', rxcui: '3639' },
  { name: 'Doxycycline', genericName: 'Doxycycline', brandNames: ['Vibramycin', 'Doryx'], drugClass: 'Broad-spectrum tetracycline 30S antibiotic', rxcui: '3640' },
  { name: 'Duloxetine', genericName: 'Duloxetine', brandNames: ['Cymbalta'], drugClass: 'Serotonin and norepinephrine reuptake inhibitor (SNRI)', rxcui: '72412' },
  { name: 'Dutasteride', genericName: 'Dutasteride', brandNames: ['Avodart'], drugClass: 'Dual type 1 and type 2 5-alpha-reductase inhibitor', rxcui: '351258' },

  // E
  { name: 'Efavirenz', genericName: 'Efavirenz', brandNames: ['Sustiva'], drugClass: 'Non-nucleoside reverse transcriptase inhibitor (NNRTI)', rxcui: '195085' },
  { name: 'Empagliflozin', genericName: 'Empagliflozin', brandNames: ['Jardiance'], drugClass: 'Sodium-glucose cotransporter-2 (SGLT2) inhibitor', rxcui: '1545653' },
  { name: 'Emtricitabine', genericName: 'Emtricitabine', brandNames: ['Emtriva'], drugClass: 'Nucleoside reverse transcriptase inhibitor (NRTI)', rxcui: '343048' },
  { name: 'Enalapril', genericName: 'Enalapril', brandNames: ['Vasotec'], drugClass: 'Angiotensin-converting enzyme (ACE) inhibitor prodrug', rxcui: '3827' },
  { name: 'Enasidenib', genericName: 'Enasidenib', brandNames: ['Idhifa'], drugClass: 'Isocitrate dehydrogenase 2 (IDH2) inhibitor', rxcui: '1946840' },
  { name: 'Encorafenib', genericName: 'Encorafenib', brandNames: ['Braftovi'], drugClass: 'BRAF protein kinase inhibitor', rxcui: '2049094' },
  { name: 'Enzalutamide', genericName: 'Enzalutamide', brandNames: ['Xtandi'], drugClass: 'Androgen receptor signaling inhibitor', rxcui: '1311027' },
  { name: 'Epinephrine', genericName: 'Epinephrine', brandNames: ['EpiPen', 'Auvi-Q', 'Adrenalin'], drugClass: 'Non-selective adrenergic alpha and beta agonist', rxcui: '3992' },
  { name: 'Eplerenone', genericName: 'Eplerenone', brandNames: ['Inspra'], drugClass: 'Selective mineralocorticoid aldosterone receptor antagonist', rxcui: '325852' },
  { name: 'Erlotinib', genericName: 'Erlotinib', brandNames: ['Tarceva'], drugClass: 'Epidermal growth factor receptor (EGFR) TKI', rxcui: '325858' },
  { name: 'Ertapenem', genericName: 'Ertapenem', brandNames: ['Invanz'], drugClass: '1-beta-methyl-carbapenem antibiotic', rxcui: '356767' },
  { name: 'Erythromycin', genericName: 'Erythromycin', brandNames: ['Ery-Tab', 'E.E.S.'], drugClass: '14-membered lactone ring macrolide antibiotic', rxcui: '4053' },
  { name: 'Escitalopram', genericName: 'Escitalopram', brandNames: ['Lexapro'], drugClass: 'Pure S-enantiomer SSRI antidepressant', rxcui: '321988' },
  { name: 'Esomeprazole', genericName: 'Esomeprazole', brandNames: ['Nexium'], drugClass: 'S-enantiomer proton pump inhibitor (PPI)', rxcui: '284659' },
  { name: 'Etanercept', genericName: 'Etanercept', brandNames: ['Enbrel'], drugClass: 'Soluble TNF receptor p75-Fc fusion protein', rxcui: '210515' },
  { name: 'Ethambutol', genericName: 'Ethambutol', brandNames: ['Myambutol'], drugClass: 'Arabinofuranosyl transferase inhibitor antimycobacterial', rxcui: '4143' },
  { name: 'Etoposide', genericName: 'Etoposide', brandNames: ['Toposar', 'VePesid'], drugClass: 'Podophyllotoxin topoisomerase II inhibitor', rxcui: '4177' },
  { name: 'Everolimus', genericName: 'Everolimus', brandNames: ['Afinitor', 'Zortress'], drugClass: 'mTOR serine/threonine kinase inhibitor', rxcui: '190367' },
  { name: 'Exemestane', genericName: 'Exemestane', brandNames: ['Aromasin'], drugClass: 'Irreversible steroidal aromatase inactivator', rxcui: '232870' },
  { name: 'Ezetimibe', genericName: 'Ezetimibe', brandNames: ['Zetia'], drugClass: 'Niemann-Pick C1-Like 1 (NPC1L1) cholesterol inhibitor', rxcui: '341248' },

  // F
  { name: 'Famotidine', genericName: 'Famotidine', brandNames: ['Pepcid'], drugClass: 'Histamine H2-receptor antagonist', rxcui: '4278' },
  { name: 'Febuxostat', genericName: 'Febuxostat', brandNames: ['Uloric'], drugClass: 'Non-purine selective xanthine oxidase inhibitor', rxcui: '644449' },
  { name: 'Fenofibrate', genericName: 'Fenofibrate', brandNames: ['Tricor', 'Trilipix', 'Lipofen'], drugClass: 'Peroxisome proliferator-activated receptor alpha agonist', rxcui: '4337' },
  { name: 'Fentanyl', genericName: 'Fentanyl', brandNames: ['Duragesic', 'Sublimaze'], drugClass: 'Potent synthetic phenylpiperidine mu-opioid agonist', rxcui: '4337' },
  { name: 'Fexofenadine', genericName: 'Fexofenadine', brandNames: ['Allegra'], drugClass: 'Second-generation non-sedating H1 antihistamine', rxcui: '76895' },
  { name: 'Finasteride', genericName: 'Finasteride', brandNames: ['Proscar', 'Propecia'], drugClass: 'Type II 5-alpha reductase inhibitor', rxcui: '4452' },
  { name: 'Fingolimod', genericName: 'Fingolimod', brandNames: ['Gilenya'], drugClass: 'Sphingosine 1-phosphate (S1P) receptor modulator', rxcui: '1011482' },
  { name: 'Flecainide', genericName: 'Flecainide', brandNames: ['Tambocor'], drugClass: 'Class 1C sodium channel blocker antiarrhythmic', rxcui: '4458' },
  { name: 'Fluconazole', genericName: 'Fluconazole', brandNames: ['Diflucan'], drugClass: 'Triazole fungal cytochrome P450 lanosterol inhibitor', rxcui: '4492' },
  { name: 'Fluorouracil', genericName: 'Fluorouracil', brandNames: ['Adrucil', 'Efudex'], drugClass: 'Pyrimidine analogue thymidylate synthase inhibitor', rxcui: '4492' },
  { name: 'Fluoxetine', genericName: 'Fluoxetine', brandNames: ['Prozac', 'Sarafem'], drugClass: 'Selective serotonin reuptake inhibitor (SSRI)', rxcui: '4493' },
  { name: 'Fluticasone', genericName: 'Fluticasone', brandNames: ['Flonase', 'Flovent'], drugClass: 'Potent synthetic fluorinated glucocorticoid', rxcui: '41126' },
  { name: 'Fluvoxamine', genericName: 'Fluvoxamine', brandNames: ['Luvox'], drugClass: 'SSRI antidepressant with sigma-1 receptor affinity', rxcui: '42463' },
  { name: 'Furosemide', genericName: 'Furosemide', brandNames: ['Lasix'], drugClass: 'Anthranilic acid derivative loop diuretic', rxcui: '4603' },

  // G
  { name: 'Gabapentin', genericName: 'Gabapentin', brandNames: ['Neurontin', 'Gralise', 'Horizant'], drugClass: 'Voltage-gated calcium channel alpha-2-delta ligand', rxcui: '25480' },
  { name: 'Galantamine', genericName: 'Galantamine', brandNames: ['Razadyne'], drugClass: 'Reversible tertiary acetylcholinesterase inhibitor', rxcui: '4684' },
  { name: 'Ganciclovir', genericName: 'Ganciclovir', brandNames: ['Cytovene'], drugClass: 'Synthetic acyclic nucleoside antiviral', rxcui: '4684' },
  { name: 'Gefitinib', genericName: 'Gefitinib', brandNames: ['Iressa'], drugClass: 'EGFR tyrosine kinase inhibitor', rxcui: '358261' },
  { name: 'Gemcitabine', genericName: 'Gemcitabine', brandNames: ['Gemzar'], drugClass: 'Difluorodeoxycytidine nucleoside analogue', rxcui: '12574' },
  { name: 'Gemfibrozil', genericName: 'Gemfibrozil', brandNames: ['Lopid'], drugClass: 'Fibric acid derivative PPAR-alpha activator', rxcui: '4719' },
  { name: 'Gentamicin', genericName: 'Gentamicin', brandNames: ['Garamycin'], drugClass: 'Aminoglycoside 30S ribosomal antibiotic', rxcui: '4767' },
  { name: 'Glimepiride', genericName: 'Glimepiride', brandNames: ['Amaryl'], drugClass: 'Third-generation sulfonylurea insulin secretagogue', rxcui: '25789' },
  { name: 'Glipizide', genericName: 'Glipizide', brandNames: ['Glucotrol'], drugClass: 'Second-generation sulfonylurea insulin secretagogue', rxcui: '4821' },
  { name: 'Glyburide', genericName: 'Glyburide', brandNames: ['Diabeta', 'Micronase'], drugClass: 'Second-generation sulfonylurea insulin secretagogue', rxcui: '4815' },
  { name: 'Guanfacine', genericName: 'Guanfacine', brandNames: ['Intuniv', 'Tenex'], drugClass: 'Selective alpha-2A adrenergic receptor agonist', rxcui: '5030' },

  // H
  { name: 'Haloperidol', genericName: 'Haloperidol', brandNames: ['Haldol'], drugClass: 'First-generation butyrophenone dopamine D2 antagonist', rxcui: '5093' },
  { name: 'Heparin', genericName: 'Heparin', brandNames: ['Hep-Lock'], drugClass: 'Unfractionated antithrombin III-potentiating glycosaminoglycan', rxcui: '5224' },
  { name: 'Hydralazine', genericName: 'Hydralazine', brandNames: ['Apresoline'], drugClass: 'Direct-acting arteriolar smooth muscle vasodilator', rxcui: '5470' },
  { name: 'Hydrochlorothiazide', genericName: 'Hydrochlorothiazide', brandNames: ['Microzide'], drugClass: 'Thiazide distal convoluted tubule diuretic', rxcui: '5487' },
  { name: 'Hydrocortisone', genericName: 'Hydrocortisone', brandNames: ['Cortef', 'Solu-Cortef'], drugClass: 'Bioidentical glucocorticoid and mineralocorticoid', rxcui: '5492' },
  { name: 'Hydromorphone', genericName: 'Hydromorphone', brandNames: ['Dilaudid'], drugClass: 'Hydrogenated ketone derivative of morphine', rxcui: '5494' },
  { name: 'Hydroxychloroquine', genericName: 'Hydroxychloroquine', brandNames: ['Plaquenil'], drugClass: '4-Aminoquinoline antimalarial and immunomodulator', rxcui: '5521' },
  { name: 'Hydroxyurea', genericName: 'Hydroxyurea', brandNames: ['Hydrea', 'Droxia'], drugClass: 'Ribonucleotide reductase inhibitor antineoplastic', rxcui: '5523' },
  { name: 'Hydroxyzine', genericName: 'Hydroxyzine', brandNames: ['Atarax', 'Vistaril'], drugClass: 'First-generation piperazine H1 antagonist anxiolytic', rxcui: '5525' },

  // I
  { name: 'Ibrutinib', genericName: 'Ibrutinib', brandNames: ['Imbruvica'], drugClass: 'Covalent Bruton tyrosine kinase (BTK) inhibitor', rxcui: '1442992' },
  { name: 'Ibuprofen', genericName: 'Ibuprofen', brandNames: ['Advil', 'Motrin'], drugClass: 'Non-steroidal anti-inflammatory drug (NSAID)', rxcui: '5640' },
  { name: 'Imatinib', genericName: 'Imatinib', brandNames: ['Gleevec', 'Glivec'], drugClass: 'BCR-ABL and KIT tyrosine kinase inhibitor', rxcui: '282388' },
  { name: 'Imipenem', genericName: 'Imipenem', brandNames: ['Primaxin'], drugClass: 'Broad-spectrum thienamycin carbapenem antibiotic', rxcui: '5679' },
  { name: 'Imipramine', genericName: 'Imipramine', brandNames: ['Tofranil'], drugClass: 'Dibenzazepine tricyclic antidepressant', rxcui: '5691' },
  { name: 'Infliximab', genericName: 'Infliximab', brandNames: ['Remicade', 'Inflectra'], drugClass: 'Chimeric anti-TNF-alpha monoclonal antibody', rxcui: '210595' },
  { name: 'Insulin Glargine', genericName: 'Insulin Glargine', brandNames: ['Lantus', 'Basaglar', 'Toujeo'], drugClass: 'Long-acting recombinant human insulin analogue', rxcui: '274783' },
  { name: 'Ipratropium', genericName: 'Ipratropium', brandNames: ['Atrovent'], drugClass: 'Quaternary ammonium muscarinic bronchodilator', rxcui: '5890' },
  { name: 'Irbesartan', genericName: 'Irbesartan', brandNames: ['Avapro'], drugClass: 'Angiotensin II receptor antagonist (ARB)', rxcui: '83515' },
  { name: 'Irinotecan', genericName: 'Irinotecan', brandNames: ['Camptosar'], drugClass: 'Camptothecin topoisomerase I inhibitor', rxcui: '64334' },
  { name: 'Isoniazid', genericName: 'Isoniazid', brandNames: ['Nydrazid', 'Laniazid'], drugClass: 'Mycolic acid synthesis inhibitor antimycobacterial', rxcui: '6038' },
  { name: 'Isosorbide Mononitrate', genericName: 'Isosorbide Mononitrate', brandNames: ['Imdur', 'Monoket'], drugClass: 'Organic nitrate vascular smooth muscle relaxant', rxcui: '6054' },
  { name: 'Itraconazole', genericName: 'Itraconazole', brandNames: ['Sporanox'], drugClass: 'Synthetic dioxolane triazole antifungal', rxcui: '28031' },
  { name: 'Ivacaftor', genericName: 'Ivacaftor', brandNames: ['Kalydeco'], drugClass: 'CFTR channel gating potentiator', rxcui: '1242564' },
  { name: 'Ivermectin', genericName: 'Ivermectin', brandNames: ['Stromectol', 'Soolantra'], drugClass: 'Avermectin glutamate-gated chloride antiparasitic', rxcui: '6083' },

  // K
  { name: 'Ketoconazole', genericName: 'Ketoconazole', brandNames: ['Nizoral', 'Extina'], drugClass: 'Imidazole broad-spectrum antifungal', rxcui: '6135' },
  { name: 'Ketorolac', genericName: 'Ketorolac', brandNames: ['Toradol', 'Acular'], drugClass: 'Pyrrolo-pyrrole NSAID analgesic', rxcui: '6142' },

  // L
  { name: 'Labetalol', genericName: 'Labetalol', brandNames: ['Trandate', 'Normodyne'], drugClass: 'Dual competitive alpha-1 and non-selective beta blocker', rxcui: '6185' },
  { name: 'Lacosamide', genericName: 'Lacosamide', brandNames: ['Vimpat'], drugClass: 'Functionalized amino acid sodium channel enhancer', rxcui: '849929' },
  { name: 'Lamivudine', genericName: 'Lamivudine', brandNames: ['Epivir'], drugClass: 'Nucleoside reverse transcriptase inhibitor (NRTI)', rxcui: '6809' },
  { name: 'Lamotrigine', genericName: 'Lamotrigine', brandNames: ['Lamictal'], drugClass: 'Phenyltriazine voltage-sensitive sodium blocker', rxcui: '28439' },
  { name: 'Lansoprazole', genericName: 'Lansoprazole', brandNames: ['Prevacid'], drugClass: 'Substituted benzimidazole proton pump inhibitor', rxcui: '28374' },
  { name: 'Lapatinib', genericName: 'Lapatinib', brandNames: ['Tykerb'], drugClass: 'Dual EGFR (ErbB1) and HER2 (ErbB2) tyrosine kinase inhibitor', rxcui: '685243' },
  { name: 'Ledipasvir', genericName: 'Ledipasvir', brandNames: ['Harvoni'], drugClass: 'HCV NS5A replication complex phosphoprotein inhibitor', rxcui: '1592823' },
  { name: 'Lenalidomide', genericName: 'Lenalidomide', brandNames: ['Revlimid'], drugClass: 'Thalidomide analogue immunomodulatory IMiD', rxcui: '612865' },
  { name: 'Lenvatinib', genericName: 'Lenvatinib', brandNames: ['Lenvima'], drugClass: 'Multiple receptor tyrosine kinase inhibitor', rxcui: '1603597' },
  { name: 'Letrozole', genericName: 'Letrozole', brandNames: ['Femara'], drugClass: 'Third-generation non-steroidal aromatase inhibitor', rxcui: '63378' },
  { name: 'Leuprolide', genericName: 'Leuprolide', brandNames: ['Lupron', 'Eligard'], drugClass: 'Synthetic GnRH / LHRH superagonist peptide', rxcui: '6387' },
  { name: 'Levetiracetam', genericName: 'Levetiracetam', brandNames: ['Keppra', 'Elepsia XR'], drugClass: 'Synaptic vesicle protein 2A (SV2A) ligand', rxcui: '7242' },
  { name: 'Levofloxacin', genericName: 'Levofloxacin', brandNames: ['Levaquin'], drugClass: 'S-enantiomer third-generation fluoroquinolone', rxcui: '82122' },
  { name: 'Levothyroxine', genericName: 'Levothyroxine', brandNames: ['Synthroid', 'Levoxyl', 'Tirosint'], drugClass: 'Synthetic crystalline tetraiodothyronine (T4)', rxcui: '10582' },
  { name: 'Lidocaine', genericName: 'Lidocaine', brandNames: ['Xylocaine'], drugClass: 'Aminoethylamide fast sodium channel blocker', rxcui: '6387' },
  { name: 'Linagliptin', genericName: 'Linagliptin', brandNames: ['Tradjenta'], drugClass: 'Xanthine-based dipeptidyl peptidase-4 (DPP-4) inhibitor', rxcui: '1114195' },
  { name: 'Linezolid', genericName: 'Linezolid', brandNames: ['Zyvox'], drugClass: 'Oxazolidinone 23S ribosomal translation inhibitor', rxcui: '243714' },
  { name: 'Liraglutide', genericName: 'Liraglutide', brandNames: ['Victoza', 'Saxenda'], drugClass: 'Glucagon-like peptide-1 (GLP-1) receptor agonist', rxcui: '897122' },
  { name: 'Lisinopril', genericName: 'Lisinopril', brandNames: ['Zestril', 'Prinivil'], drugClass: 'Peptidyl dipeptidase ACE inhibitor', rxcui: '29046' },
  { name: 'Lithium', genericName: 'Lithium', brandNames: ['Lithobid', 'Eskalith'], drugClass: 'Monovalent alkali metal inositol phosphatase inhibitor', rxcui: '6448' },
  { name: 'Loratadine', genericName: 'Loratadine', brandNames: ['Claritin', 'Alavert'], drugClass: 'Second-generation non-sedating H1 antihistamine', rxcui: '6470' },
  { name: 'Lorazepam', genericName: 'Lorazepam', brandNames: ['Ativan'], drugClass: 'Intermediate-acting 3-hydroxy benzodiazepine', rxcui: '6470' },
  { name: 'Losartan', genericName: 'Losartan', brandNames: ['Cozaar'], drugClass: 'Angiotensin II type 1 receptor antagonist (ARB)', rxcui: '52175' },

  // M
  { name: 'Meloxicam', genericName: 'Meloxicam', brandNames: ['Mobic'], drugClass: 'Oxicam NSAID preferential COX-2 inhibitor', rxcui: '6754' },
  { name: 'Memantine', genericName: 'Memantine', brandNames: ['Namenda'], drugClass: 'Uncompetitive low-affinity NMDA receptor antagonist', rxcui: '6758' },
  { name: 'Mercaptopurine', genericName: 'Mercaptopurine', brandNames: ['Purinethol'], drugClass: 'Thiopurine purine antimetabolite', rxcui: '6784' },
  { name: 'Meropenem', genericName: 'Meropenem', brandNames: ['Merrem'], drugClass: 'Broad-spectrum synthetic carbapenem antibiotic', rxcui: '6794' },
  { name: 'Mesalamine', genericName: 'Mesalamine', brandNames: ['Lialda', 'Asacol', 'Apriso'], drugClass: '5-Aminosalicylic acid mucosal anti-inflammatory', rxcui: '6809' },
  { name: 'Metformin', genericName: 'Metformin', brandNames: ['Glucophage', 'Fortamet', 'Glumetza', 'Riomet'], drugClass: 'Biguanide oral antihyperglycemic / AMPK activator', rxcui: '6809' },
  { name: 'Methadone', genericName: 'Methadone', brandNames: ['Dolophine', 'Methadose'], drugClass: 'Synthetic long-acting mu-opioid agonist and NMDA antagonist', rxcui: '6813' },
  { name: 'Methotrexate', genericName: 'Methotrexate', brandNames: ['Trexall', 'Otrexup', 'Rasuvo'], drugClass: 'Dihydrofolate reductase inhibitor antimetabolite', rxcui: '6851' },
  { name: 'Methylphenidate', genericName: 'Methylphenidate', brandNames: ['Ritalin', 'Concerta', 'Metadate'], drugClass: 'CNS stimulant dopamine-norepinephrine reuptake inhibitor', rxcui: '6901' },
  { name: 'Methylprednisolone', genericName: 'Methylprednisolone', brandNames: ['Medrol', 'Solu-Medrol'], drugClass: 'Synthetic intermediate-acting glucocorticoid', rxcui: '6902' },
  { name: 'Metoclopramide', genericName: 'Metoclopramide', brandNames: ['Reglan'], drugClass: 'Central dopamine D2 antagonist and 5-HT4 agonist', rxcui: '6915' },
  { name: 'Metoprolol', genericName: 'Metoprolol', brandNames: ['Lopressor', 'Toprol-XL'], drugClass: 'Cardioselective beta-1 adrenergic blocker', rxcui: '6918' },
  { name: 'Metronidazole', genericName: 'Metronidazole', brandNames: ['Flagyl'], drugClass: 'Synthetic nitroimidazole DNA disruptor antimicrobial', rxcui: '6922' },
  { name: 'Midazolam', genericName: 'Midazolam', brandNames: ['Versed'], drugClass: 'Imidazobenzodiazepine short-acting central sedative', rxcui: '6960' },
  { name: 'Minocycline', genericName: 'Minocycline', brandNames: ['Minocin', 'Solodyn'], drugClass: 'Broad-spectrum lipophilic tetracycline antibiotic', rxcui: '7004' },
  { name: 'Mirtazapine', genericName: 'Mirtazapine', brandNames: ['Remeron'], drugClass: 'Noradrenergic and specific serotonergic antidepressant (NaSSA)', rxcui: '15996' },
  { name: 'Molnupiravir', genericName: 'Molnupiravir', brandNames: ['Lagevrio'], drugClass: 'Ribonucleoside analogue viral mutagenesis inducer', rxcui: '2587023' },
  { name: 'Montelukast', genericName: 'Montelukast', brandNames: ['Singulair'], drugClass: 'Cysteinyl leukotriene CysLT1 receptor antagonist', rxcui: '88249' },
  { name: 'Morphine', genericName: 'Morphine', brandNames: ['MS Contin', 'Kadian'], drugClass: 'Prototypical phenanthrene alkaloid opioid agonist', rxcui: '7052' },
  { name: 'Moxifloxacin', genericName: 'Moxifloxacin', brandNames: ['Avelox', 'Vigamox'], drugClass: 'Fourth-generation 8-methoxy fluoroquinolone', rxcui: '139462' },
  { name: 'Mycophenolate Mofetil', genericName: 'Mycophenolate Mofetil', brandNames: ['CellCept'], drugClass: 'Inosine monophosphate dehydrogenase (IMPDH) inhibitor', rxcui: '685243' },

  // N
  { name: 'Naloxone', genericName: 'Naloxone', brandNames: ['Narcan', 'Kloxxado'], drugClass: 'Pure competitive mu-opioid receptor antagonist', rxcui: '7242' },
  { name: 'Naltrexone', genericName: 'Naltrexone', brandNames: ['Vivitrol', 'ReVia'], drugClass: 'Long-acting competitive opioid antagonist', rxcui: '7243' },
  { name: 'Naproxen', genericName: 'Naproxen', brandNames: ['Aleve', 'Naprosyn'], drugClass: 'Non-steroidal anti-inflammatory drug (NSAID)', rxcui: '7258' },
  { name: 'Nebivolol', genericName: 'Nebivolol', brandNames: ['Bystolic'], drugClass: 'Highly selective beta-1 blocker with nitric oxide release', rxcui: '325852' },
  { name: 'Nevirapine', genericName: 'Nevirapine', brandNames: ['Viramune'], drugClass: 'Dipyridodiazepinone NNRTI antiretroviral', rxcui: '7396' },
  { name: 'Niclosamide', genericName: 'Niclosamide', brandNames: ['Niclocide'], drugClass: 'Salicylanilide mitochondrial uncoupler anthelmintic', rxcui: '7414' },
  { name: 'Nifedipine', genericName: 'Nifedipine', brandNames: ['Procardia', 'Adalat'], drugClass: 'Prototypical dihydropyridine calcium channel blocker', rxcui: '7417' },
  { name: 'Nilotinib', genericName: 'Nilotinib', brandNames: ['Tasigna'], drugClass: 'Second-generation selective BCR-ABL tyrosine kinase inhibitor', rxcui: '685243' },
  { name: 'Nirmatrelvir', genericName: 'Nirmatrelvir', brandNames: ['Paxlovid'], drugClass: 'SARS-CoV-2 3C-like protease (Mpro) inhibitor', rxcui: '2587024' },
  { name: 'Nitazoxanide', genericName: 'Nitazoxanide', brandNames: ['Alinia'], drugClass: 'Synthetic thiazolide pyruvate ferredoxin oxidoreductase inhibitor', rxcui: '38413' },
  { name: 'Nitrofurantoin', genericName: 'Nitrofurantoin', brandNames: ['Macrobid', 'Macrodantin'], drugClass: 'Nitrofuran synthetic bactericidal antibacterial', rxcui: '7454' },
  { name: 'Nitroglycerin', genericName: 'Nitroglycerin', brandNames: ['Nitrostat', 'Nitro-Dur'], drugClass: 'Organic nitrate nitric oxide donor vasodilator', rxcui: '7456' },
  { name: 'Nivolumab', genericName: 'Nivolumab', brandNames: ['Opdivo'], drugClass: 'Human immunoglobulin G4 anti-PD-1 monoclonal antibody', rxcui: '1597876' },

  // O
  { name: 'Olanzapine', genericName: 'Olanzapine', brandNames: ['Zyprexa'], drugClass: 'Thienobenzodiazepine atypical antipsychotic', rxcui: '32937' },
  { name: 'Olaparib', genericName: 'Olaparib', brandNames: ['Lynparza'], drugClass: 'Poly (ADP-ribose) polymerase (PARP) inhibitor', rxcui: '1599824' },
  { name: 'Olmesartan', genericName: 'Olmesartan', brandNames: ['Benicar'], drugClass: 'Selective AT1 subtype angiotensin receptor blocker', rxcui: '343047' },
  { name: 'Omeprazole', genericName: 'Omeprazole', brandNames: ['Prilosec'], drugClass: 'Substituted benzimidazole proton pump inhibitor (PPI)', rxcui: '7646' },
  { name: 'Ondansetron', genericName: 'Ondansetron', brandNames: ['Zofran'], drugClass: 'Selective 5-HT3 receptor antagonist antiemetic', rxcui: '7646' },
  { name: 'Oseltamivir', genericName: 'Oseltamivir', brandNames: ['Tamiflu'], drugClass: 'Influenza viral neuraminidase enzyme inhibitor prodrug', rxcui: '141975' },
  { name: 'Osimertinib', genericName: 'Osimertinib', brandNames: ['Tagrisso'], drugClass: 'Third-generation irreversible mutant EGFR TKI', rxcui: '1723958' },
  { name: 'Oxaliplatin', genericName: 'Oxaliplatin', brandNames: ['Eloxatin'], drugClass: 'Third-generation organoplatinum complex antineoplastic', rxcui: '325852' },
  { name: 'Oxycodone', genericName: 'Oxycodone', brandNames: ['OxyContin', 'Roxicodone', 'Percocet'], drugClass: 'Semisynthetic thebaine-derived opioid analgesic', rxcui: '7804' },

  // P
  { name: 'Paclitaxel', genericName: 'Paclitaxel', brandNames: ['Taxol', 'Abraxane'], drugClass: 'Taxane plant alkaloid microtubule promoter', rxcui: '7824' },
  { name: 'Palbociclib', genericName: 'Palbociclib', brandNames: ['Ibrance'], drugClass: 'Cyclin-dependent kinase 4 and 6 (CDK4/6) inhibitor', rxcui: '1601380' },
  { name: 'Pantoprazole', genericName: 'Pantoprazole', brandNames: ['Protonix'], drugClass: 'Substituted benzimidazole gastric proton pump inhibitor', rxcui: '40790' },
  { name: 'Paroxetine', genericName: 'Paroxetine', brandNames: ['Paxil', 'Pexeva'], drugClass: 'Selective serotonin reuptake inhibitor (SSRI)', rxcui: '32937' },
  { name: 'Pembrolizumab', genericName: 'Pembrolizumab', brandNames: ['Keytruda'], drugClass: 'Humanized IgG4 kappa anti-PD-1 monoclonal antibody', rxcui: '1547545' },
  { name: 'Pemetrexed', genericName: 'Pemetrexed', brandNames: ['Alimta'], drugClass: 'Multitargeted antifolate antimetabolite', rxcui: '358262' },
  { name: 'Penicillin V', genericName: 'Penicillin V', brandNames: ['Veetids', 'Pen-Vee K'], drugClass: 'Phenoxymethylpenicillin beta-lactam antibacterial', rxcui: '7984' },
  { name: 'Phenobarbital', genericName: 'Phenobarbital', brandNames: ['Luminal'], drugClass: 'Long-acting barbiturate GABA-A positive modulator', rxcui: '8134' },
  { name: 'Phenytoin', genericName: 'Phenytoin', brandNames: ['Dilantin', 'Phenytek'], drugClass: 'Hydantoin voltage-dependent sodium channel blocker', rxcui: '8163' },
  { name: 'Pioglitazone', genericName: 'Pioglitazone', brandNames: ['Actos'], drugClass: 'Thiazolidinedione PPAR-gamma receptor agonist', rxcui: '33738' },
  { name: 'Pomalidomide', genericName: 'Pomalidomide', brandNames: ['Pomalyst'], drugClass: 'Third-generation thalidomide analogue IMiD', rxcui: '1370591' },
  { name: 'Ponatinib', genericName: 'Ponatinib', brandNames: ['Iclusig'], drugClass: 'Third-generation multi-targeted kinase inhibitor (T315I)', rxcui: '1368021' },
  { name: 'Posaconazole', genericName: 'Posaconazole', brandNames: ['Noxafil'], drugClass: 'Extended-spectrum triazole antifungal', rxcui: '282388' },
  { name: 'Pravastatin', genericName: 'Pravastatin', brandNames: ['Pravachol'], drugClass: 'HMG-CoA reductase inhibitor (Statin)', rxcui: '42463' },
  { name: 'Prednisolone', genericName: 'Prednisolone', brandNames: ['Prelone', 'Orapred'], drugClass: 'Intermediate-acting synthetic glucocorticoid', rxcui: '8640' },
  { name: 'Prednisone', genericName: 'Prednisone', brandNames: ['Deltasone', 'Rayos'], drugClass: 'Synthetic corticosteroid prodrug', rxcui: '8640' },
  { name: 'Pregabalin', genericName: 'Pregabalin', brandNames: ['Lyrica'], drugClass: 'GABA analogue voltage-gated calcium channel ligand', rxcui: '187832' },
  { name: 'Propranolol', genericName: 'Propranolol', brandNames: ['Inderal', 'InnoPran XL'], drugClass: 'Non-selective beta-1 and beta-2 adrenergic blocker', rxcui: '8787' },
  { name: 'Pyrimethamine', genericName: 'Pyrimethamine', brandNames: ['Daraprim'], drugClass: 'Diaminopyrimidine dihydrofolate reductase inhibitor', rxcui: '8919' },

  // Q
  { name: 'Quetiapine', genericName: 'Quetiapine', brandNames: ['Seroquel'], drugClass: 'Dibenzothiazepine atypical antipsychotic', rxcui: '51272' },

  // R
  { name: 'Raloxifene', genericName: 'Raloxifene', brandNames: ['Evista'], drugClass: 'Selective estrogen receptor modulator (SERM)', rxcui: '35296' },
  { name: 'Raltegravir', genericName: 'Raltegravir', brandNames: ['Isentress'], drugClass: 'HIV-1 integrase catalytic site inhibitor', rxcui: '702410' },
  { name: 'Ramipril', genericName: 'Ramipril', brandNames: ['Altace'], drugClass: 'Long-acting non-sulfhydryl ACE inhibitor prodrug', rxcui: '35296' },
  { name: 'Ranitidine', genericName: 'Ranitidine', brandNames: ['Zantac'], drugClass: 'Furan-based histamine H2-receptor antagonist', rxcui: '9143' },
  { name: 'Remdesivir', genericName: 'Remdesivir', brandNames: ['Veklury'], drugClass: 'Nucleotide analogue viral RNA polymerase inhibitor', rxcui: '2284718' },
  { name: 'Ribociclib', genericName: 'Ribociclib', brandNames: ['Kisqali'], drugClass: 'Cyclin-dependent kinase 4 and 6 (CDK4/6) inhibitor', rxcui: '1873983' },
  { name: 'Rifampin', genericName: 'Rifampin', brandNames: ['Rifadin'], drugClass: 'Rifamycin bacterial DNA-dependent RNA polymerase inhibitor', rxcui: '9384' },
  { name: 'Rifaximin', genericName: 'Rifaximin', brandNames: ['Xifaxan'], drugClass: 'Non-systemic rifamycin gastrointestinal antibacterial', rxcui: '358262' },
  { name: 'Risperidone', genericName: 'Risperidone', brandNames: ['Risperdal'], drugClass: 'Benzisoxazole atypical antipsychotic D2/5-HT2A antagonist', rxcui: '35636' },
  { name: 'Ritonavir', genericName: 'Ritonavir', brandNames: ['Norvir'], drugClass: 'HIV protease inhibitor and CYP3A4 pharmacokinetic booster', rxcui: '85762' },
  { name: 'Rituximab', genericName: 'Rituximab', brandNames: ['Rituxan'], drugClass: 'Chimeric murine/human monoclonal anti-CD20 antibody', rxcui: '121191' },
  { name: 'Rivaroxaban', genericName: 'Rivaroxaban', brandNames: ['Xarelto'], drugClass: 'Direct factor Xa oral anticoagulant', rxcui: '1114195' },
  { name: 'Rosuvastatin', genericName: 'Rosuvastatin', brandNames: ['Crestor'], drugClass: 'Enantiopure hydrophilic HMG-CoA reductase inhibitor (Statin)', rxcui: '301542' },
  { name: 'Ruxolitinib', genericName: 'Ruxolitinib', brandNames: ['Jakafi'], drugClass: 'Selective Janus kinase JAK1 and JAK2 inhibitor', rxcui: '1228514' },

  // S
  { name: 'Semaglutide', genericName: 'Semaglutide', brandNames: ['Ozempic', 'Wegovy', 'Rybelsus'], drugClass: 'GLP-1 receptor agonist peptide', rxcui: '1991302' },
  { name: 'Sertraline', genericName: 'Sertraline', brandNames: ['Zoloft'], drugClass: 'Selective serotonin reuptake inhibitor (SSRI)', rxcui: '36437' },
  { name: 'Sildenafil', genericName: 'Sildenafil', brandNames: ['Viagra', 'Revatio'], drugClass: 'Phosphodiesterase-5 (PDE5) inhibitor', rxcui: '88249' },
  { name: 'Simvastatin', genericName: 'Simvastatin', brandNames: ['Zocor'], drugClass: 'HMG-CoA reductase inhibitor (Statin)', rxcui: '36567' },
  { name: 'Sirolimus', genericName: 'Sirolimus', brandNames: ['Rapamune'], drugClass: 'mTOR serine/threonine kinase inhibitor immunosuppressive', rxcui: '25480' },
  { name: 'Sitagliptin', genericName: 'Sitagliptin', brandNames: ['Januvia'], drugClass: 'Dipeptidyl peptidase-4 (DPP-4) inhibitor', rxcui: '593411' },
  { name: 'Sofosbuvir', genericName: 'Sofosbuvir', brandNames: ['Sovaldi'], drugClass: 'Nucleotide prodrug HCV NS5B polymerase inhibitor', rxcui: '1439773' },
  { name: 'Spironolactone', genericName: 'Spironolactone', brandNames: ['Aldactone', 'CaroSpir'], drugClass: 'Potassium-sparing mineralocorticoid receptor antagonist', rxcui: '9997' },
  { name: 'Sulfamethoxazole', genericName: 'Sulfamethoxazole', brandNames: ['Bactrim', 'Septra'], drugClass: 'Sulfonamide dihydropteroate synthase inhibitor', rxcui: '10167' },
  { name: 'Sumatriptan', genericName: 'Sumatriptan', brandNames: ['Imitrex'], drugClass: 'Selective vascular 5-HT 1B/1D receptor agonist triptan', rxcui: '10180' },

  // T
  { name: 'Tacrolimus', genericName: 'Tacrolimus', brandNames: ['Prograf', 'Protopic'], drugClass: 'Macrolide calcineurin inhibitor immunosuppressive', rxcui: '42347' },
  { name: 'Tadalafil', genericName: 'Tadalafil', brandNames: ['Cialis', 'Adcirca'], drugClass: 'Long-acting phosphodiesterase-5 (PDE5) inhibitor', rxcui: '325858' },
  { name: 'Tamoxifen', genericName: 'Tamoxifen', brandNames: ['Nolvadex', 'Soltamox'], drugClass: 'Selective estrogen receptor modulator (SERM)', rxcui: '10324' },
  { name: 'Tamsulosin', genericName: 'Tamsulosin', brandNames: ['Flomax'], drugClass: 'Uroselective alpha-1A adrenergic receptor antagonist', rxcui: '77492' },
  { name: 'Telmisartan', genericName: 'Telmisartan', brandNames: ['Micardis'], drugClass: 'Angiotensin II receptor antagonist (ARB)', rxcui: '83515' },
  { name: 'Tenofovir', genericName: 'Tenofovir', brandNames: ['Viread', 'Vemlidy'], drugClass: 'Nucleotide reverse transcriptase inhibitor (NtRTI)', rxcui: '29046' },
  { name: 'Terbinafine', genericName: 'Terbinafine', brandNames: ['Lamisil'], drugClass: 'Allylamine fungal squalene epoxidase inhibitor', rxcui: '38413' },
  { name: 'Thalidomide', genericName: 'Thalidomide', brandNames: ['Thalomid'], drugClass: 'Immunomodulatory drug (IMiD) / Cereblon modulator', rxcui: '10432' },
  { name: 'Ticagrelor', genericName: 'Ticagrelor', brandNames: ['Brilinta'], drugClass: 'Reversible direct-acting P2Y12 ADP receptor inhibitor', rxcui: '1114195' },
  { name: 'Tiotropium', genericName: 'Tiotropium', brandNames: ['Spiriva'], drugClass: 'Long-acting muscarinic antagonist (LAMA) bronchodilator', rxcui: '274783' },
  { name: 'Tobramycin', genericName: 'Tobramycin', brandNames: ['TOBI', 'Tobrex'], drugClass: 'Aminoglycoside 30S ribosomal bactericidal antibiotic', rxcui: '10627' },
  { name: 'Tofacitinib', genericName: 'Tofacitinib', brandNames: ['Xeljanz'], drugClass: 'Janus kinase (JAK1 and JAK3) inhibitor', rxcui: '1359133' },
  { name: 'Topiramate', genericName: 'Topiramate', brandNames: ['Topamax'], drugClass: 'Sulfamate-substituted monosaccharide anticonvulsant', rxcui: '38404' },
  { name: 'Tramadol', genericName: 'Tramadol', brandNames: ['Ultram', 'ConZip'], drugClass: 'Centrally acting mu-opioid agonist and SNRI analgesic', rxcui: '10689' },
  { name: 'Trastuzumab', genericName: 'Trastuzumab', brandNames: ['Herceptin'], drugClass: 'Humanized IgG1 monoclonal antibody targeting HER2', rxcui: '2284718' },
  { name: 'Trazodone', genericName: 'Trazodone', brandNames: ['Desyrel', 'Oleptro'], drugClass: 'Serotonin antagonist and reuptake inhibitor (SARI)', rxcui: '10724' },

  // U - V
  { name: 'Upadacitinib', genericName: 'Upadacitinib', brandNames: ['Rinvoq'], drugClass: 'Second-generation selective JAK1 inhibitor', rxcui: '2194682' },
  { name: 'Valacyclovir', genericName: 'Valacyclovir', brandNames: ['Valtrex'], drugClass: 'L-valyl ester prodrug of acyclovir antiviral', rxcui: '76895' },
  { name: 'Valsartan', genericName: 'Valsartan', brandNames: ['Diovan'], drugClass: 'Non-peptide angiotensin II receptor antagonist (ARB)', rxcui: '69749' },
  { name: 'Vancomycin', genericName: 'Vancomycin', brandNames: ['Vancocin'], drugClass: 'Tricyclic glycopeptide cell wall synthesis inhibitor', rxcui: '11124' },
  { name: 'Vardenafil', genericName: 'Vardenafil', brandNames: ['Levitra', 'Staxyn'], drugClass: 'Potent phosphodiesterase-5 (PDE5) inhibitor', rxcui: '358262' },
  { name: 'Varenicline', genericName: 'Varenicline', brandNames: ['Chantix'], drugClass: 'Alpha-4 beta-2 nicotinic acetylcholine receptor partial agonist', rxcui: '636734' },
  { name: 'Venetoclax', genericName: 'Venetoclax', brandNames: ['Venclexta'], drugClass: 'Selective B-cell lymphoma-2 (BCL-2) inhibitor', rxcui: '1740621' },
  { name: 'Venlafaxine', genericName: 'Venlafaxine', brandNames: ['Effexor'], drugClass: 'Serotonin and norepinephrine reuptake inhibitor (SNRI)', rxcui: '39786' },
  { name: 'Verapamil', genericName: 'Verapamil', brandNames: ['Calan', 'Verelan'], drugClass: 'Phenylalkylamine non-dihydropyridine calcium channel blocker', rxcui: '11170' },
  { name: 'Voriconazole', genericName: 'Voriconazole', brandNames: ['Vfend'], drugClass: 'Second-generation triazole antifungal', rxcui: '121191' },

  // W - Z
  { name: 'Warfarin', genericName: 'Warfarin', brandNames: ['Coumadin', 'Jantoven'], drugClass: 'Vitamin K antagonist anticoagulant (VKORC1)', rxcui: '11289' },
  { name: 'Zafirlukast', genericName: 'Zafirlukast', brandNames: ['Accolate'], drugClass: 'Leukotriene receptor antagonist (LTRA)', rxcui: '77492' },
  { name: 'Zanubrutinib', genericName: 'Zanubrutinib', brandNames: ['Brukinsa'], drugClass: 'Second-generation Bruton tyrosine kinase (BTK) inhibitor', rxcui: '2261623' },
  { name: 'Zidovudine', genericName: 'Zidovudine', brandNames: ['Retrovir'], drugClass: 'Thymidine nucleoside reverse transcriptase inhibitor', rxcui: '11413' },
  { name: 'Ziprasidone', genericName: 'Ziprasidone', brandNames: ['Geodon'], drugClass: 'Atypical benzisothiazolyl piperazine antipsychotic', rxcui: '54449' },
  { name: 'Zoledronic Acid', genericName: 'Zoledronic Acid', brandNames: ['Zometa', 'Reclast'], drugClass: 'Third-generation nitrogenous bisphosphonate', rxcui: '29046' },
  { name: 'Zolmitriptan', genericName: 'Zolmitriptan', brandNames: ['Zomig'], drugClass: 'Selective vascular 5-HT 1B/1D receptor agonist triptan', rxcui: '64334' },
  { name: 'Zolpidem', genericName: 'Zolpidem', brandNames: ['Ambien', 'Intermezzo'], drugClass: 'Imidazopyridine selective GABA-A alpha-1 subunit modulator', rxcui: '39993' },
];

/**
 * Calculates Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Phonetic normalization tuned for biomedical and pharmaceutical nomenclature.
 * Maps common homophones, Latin/Greek diphthongs, and consonant variants.
 */
export function normalizePhonetic(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/rh/g, 'r')
    .replace(/ae|oe/g, 'e')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/z/g, 's')
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1'); // Collapse repeated consonants
}

/**
 * Calculates normalized similarity ratio between 0.0 and 1.0
 */
export function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Identifies high-confidence close matches when a user has a spelling
 * or voice pronunciation typo (e.g. "metformen" -> Metformin, "talidomide" -> Thalidomide).
 */
export function findFuzzyDrugCorrection(rawQuery: string): DrugDirectoryEntry | null {
  const query = (rawQuery || '').trim().toLowerCase();
  if (query.length < 3) return null;

  const qPhonetic = normalizePhonetic(query);

  let bestEntry: DrugDirectoryEntry | null = null;
  let bestScore = 0;
  let bestMatchedTerm = '';
  let bestMatchedOn: 'generic' | 'brand' | 'phonetic' | 'fuzzy' = 'fuzzy';

  for (const entry of DRUG_DIRECTORY) {
    const genericLower = entry.genericName.toLowerCase();
    const gPhonetic = normalizePhonetic(genericLower);

    // If query is an exact generic match, no correction needed
    if (genericLower === query) {
      return null;
    }

    // Check generic phonetic match
    if (qPhonetic === gPhonetic) {
      return {
        ...entry,
        matchedOn: 'phonetic',
        matchedTerm: entry.genericName,
        isFuzzyCorrection: true,
        similarityScore: 0.96,
      };
    }

    // Check generic edit distance similarity
    const genericSim = calculateSimilarity(query, genericLower);
    const genericDist = levenshteinDistance(query, genericLower);

    if ((genericDist <= 2 || genericSim >= 0.72) && genericSim > bestScore) {
      bestScore = genericSim;
      bestEntry = entry;
      bestMatchedTerm = entry.genericName;
      bestMatchedOn = 'fuzzy';
    }

    // Check all brand names
    for (const brand of entry.brandNames) {
      const brandLower = brand.toLowerCase();
      if (brandLower === query) {
        return null; // Exact brand match
      }

      const bPhonetic = normalizePhonetic(brandLower);
      if (qPhonetic === bPhonetic) {
        return {
          ...entry,
          matchedOn: 'brand',
          matchedTerm: brand,
          isFuzzyCorrection: true,
          similarityScore: 0.95,
        };
      }

      const brandSim = calculateSimilarity(query, brandLower);
      const brandDist = levenshteinDistance(query, brandLower);
      if ((brandDist <= 2 || brandSim >= 0.72) && brandSim > bestScore) {
        bestScore = brandSim;
        bestEntry = entry;
        bestMatchedTerm = brand;
        bestMatchedOn = 'brand';
      }
    }
  }

  if (bestEntry && bestScore >= 0.72) {
    return {
      ...bestEntry,
      matchedOn: bestMatchedOn,
      matchedTerm: bestMatchedTerm,
      isFuzzyCorrection: true,
      similarityScore: bestScore,
    };
  }

  return null;
}

/**
 * Searches the drug directory with strict progressive elimination matching,
 * backed by phonetic & fuzzy correction fallback for spelling and voice errors.
 * Requires at least 3 characters.
 */
export function searchDrugDirectory(rawQuery: string, maxResults = 8): DrugDirectoryEntry[] {
  const query = (rawQuery || '').trim().toLowerCase();

  // Enforce 3 character minimum
  if (query.length < 3) {
    return [];
  }

  const exactPrefixMatches: DrugDirectoryEntry[] = [];
  const brandPrefixMatches: DrugDirectoryEntry[] = [];
  const wordPrefixMatches: DrugDirectoryEntry[] = [];
  const seenKeys = new Set<string>();

  for (const entry of DRUG_DIRECTORY) {
    const genericLower = entry.genericName.toLowerCase();

    // 1. Primary check: Generic name starts with the typed query
    if (genericLower.startsWith(query)) {
      if (!seenKeys.has(genericLower)) {
        seenKeys.add(genericLower);
        exactPrefixMatches.push({
          ...entry,
          matchedOn: 'generic',
          matchedTerm: entry.genericName,
        });
      }
      continue;
    }

    // 2. Secondary check: Any brand name starts with the typed query
    let matchedBrand = '';
    for (const b of entry.brandNames) {
      if (b.toLowerCase().startsWith(query)) {
        matchedBrand = b;
        break;
      }
    }

    if (matchedBrand) {
      const key = `${entry.genericName}:${matchedBrand}`.toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        brandPrefixMatches.push({
          ...entry,
          matchedOn: 'brand',
          matchedTerm: matchedBrand,
        });
      }
      continue;
    }

    // 3. Tertiary check: Word-boundary prefix (e.g. "Acid" in "Azelaic Acid" if user typed "aci")
    const words = genericLower.split(/\s+/);
    if (words.some((w) => w.startsWith(query))) {
      if (!seenKeys.has(genericLower)) {
        seenKeys.add(genericLower);
        wordPrefixMatches.push({
          ...entry,
          matchedOn: 'generic',
          matchedTerm: entry.genericName,
        });
      }
    }
  }

  const combinedPrefix = [
    ...exactPrefixMatches.sort((a, b) => a.name.localeCompare(b.name)),
    ...brandPrefixMatches.sort((a, b) => a.name.localeCompare(b.name)),
    ...wordPrefixMatches.sort((a, b) => a.name.localeCompare(b.name)),
  ];

  // If we have prefix matches, return them
  if (combinedPrefix.length > 0) {
    return combinedPrefix.slice(0, maxResults);
  }

  // If NO prefix matches exist, run fuzzy/phonetic search for typos & pronunciation errors
  const qPhonetic = normalizePhonetic(query);
  const fuzzyScored: Array<{ entry: DrugDirectoryEntry; score: number }> = [];

  for (const entry of DRUG_DIRECTORY) {
    const genericLower = entry.genericName.toLowerCase();
    const gPhonetic = normalizePhonetic(genericLower);

    let matchScore = 0;
    let matchedTerm = entry.genericName;
    let matchedOn: 'generic' | 'brand' | 'phonetic' | 'fuzzy' = 'fuzzy';

    if (qPhonetic === gPhonetic) {
      matchScore = 0.95;
      matchedOn = 'phonetic';
    } else {
      const genericSim = calculateSimilarity(query, genericLower);
      const genericDist = levenshteinDistance(query, genericLower);
      if (genericDist <= 2 || genericSim >= 0.70) {
        matchScore = genericSim;
      }
    }

    // Also check brand names for fuzzy similarity
    for (const brand of entry.brandNames) {
      const brandLower = brand.toLowerCase();
      const bPhonetic = normalizePhonetic(brandLower);
      if (qPhonetic === bPhonetic) {
        if (0.94 > matchScore) {
          matchScore = 0.94;
          matchedTerm = brand;
          matchedOn = 'brand';
        }
      } else {
        const brandSim = calculateSimilarity(query, brandLower);
        const brandDist = levenshteinDistance(query, brandLower);
        if ((brandDist <= 2 || brandSim >= 0.70) && brandSim > matchScore) {
          matchScore = brandSim;
          matchedTerm = brand;
          matchedOn = 'brand';
        }
      }
    }

    if (matchScore >= 0.70) {
      fuzzyScored.push({
        entry: {
          ...entry,
          matchedOn,
          matchedTerm,
          isFuzzyCorrection: true,
          similarityScore: matchScore,
        },
        score: matchScore,
      });
    }
  }

  // Sort fuzzy candidates by highest similarity score
  fuzzyScored.sort((a, b) => b.score - a.score);
  return fuzzyScored.map((s) => s.entry).slice(0, maxResults);
}

