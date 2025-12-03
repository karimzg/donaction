export interface KlubFilters {
  klubrUuid: string | null;
  status: string | null;
  completion: string | null;
  sportType: string[] | null;
  federation: string | null;
  documentsToValidate: boolean | null;
  searchParams?: string;
}

export const COL_FILTERS_LIST_VALUES = {
  STATE: {label: 'État', value: 'status', sortable: true},
  SPORT: {label: 'Sport', value: 'sportType', sortable: true},
  FEDERATION: {label: 'Fédération', value: 'federationLink.name', sortable: true},
  REGION: {label: 'Région', value: 'siegeSocialRegion', sortable: true},
  NUMBER_OF_MEMBERS: {label: 'Nb de membres', value: 'statNbMembers', sortable: true},
  NUMBER_OF_PROJECTS: {label: 'Nb de projets', value: 'nbProjects', sortable: true},
  AMOUNT_COLLECTED: {label: 'Montant collecté', value: 'statDonsTotalAmount', sortable: true},
  COMPLETION: {label: 'Complétion klub', value: 'klubr_info.requiredFieldsCompletion', sortable: true},
  COMPLETION_KLUB_HOUSE: {label: 'C.Klub House', value: 'completion_klub_house', sortable: false},
  STATUS_DOCS: {label: 'Documents', value: 'status_docs', sortable: false},
  ASSOCIATION_STATUS: {label: 'Statut A.', value: 'klubr_document.statutsAssociation', sortable: true},
  SITUATION_NOTICE: {label: 'Avis', value: 'klubr_document.avisSituationSIRENE', sortable: true},
  FEDERATION_AFFILIATION_CERTIFICATE: {
    label: 'Affiliation',
    value: 'klubr_document.attestationAffiliationFederation',
    sortable: true
  },
  ASSOCIATION_RIB: {label: 'RIB', value: 'klubr_document.ribAssociation', sortable: true},
  PRESIDENT_DESIGNATION_ACT: {label: 'Président', value: 'klubr_document.justifDesignationPresident', sortable: true},
  LAST_UPDATED_AT: {label: 'Dernière MAJ', value: 'last_updated_at', sortable: false},
};

