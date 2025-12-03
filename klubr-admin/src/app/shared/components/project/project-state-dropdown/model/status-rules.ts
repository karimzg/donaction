import { UserRole } from "@shared/utils/models/user-details";
import { ProjectStatus } from "@shared/utils/models/klubr";

export interface Status {
  key: STATUS_VALUES;
  label: string;
  color?: string;
  apiKey: ProjectStatus;
}

export enum STATUS_VALUES {
  DRAFT = 'DRAFT',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  DELETED = 'DELETED',
  BILLED = 'BILLED',
}

export const getLabelFromApiKey = (apiKey: ProjectStatus): string => {
  return STATUS.find((s: Status) => s.apiKey === apiKey)?.label || '';
}
export const STATUS: Array<Status> = [
  {
    key: STATUS_VALUES.DRAFT,
    label: 'Brouillon',
    color: '#8312C8',
    apiKey: 'draft'
  },
  {
    key: STATUS_VALUES.WAITING_APPROVAL,
    label: 'En attente de validation',
    color: '#F79707',
    apiKey: 'waitingApproval'
  },
  {
    key: STATUS_VALUES.PUBLISHED,
    label: 'Publié',
    color: '#22C55E',
    apiKey: 'published'
  },
  {
    key: STATUS_VALUES.CLOSED,
    label: 'Clôturé',
    color: '#64748B',
    apiKey: 'closed'
  },
  {
    key: STATUS_VALUES.DELETED,
    label: 'Supprimé',
    color: '#DD1F2A',
    apiKey: 'deleted'
  },
  {
    key: STATUS_VALUES.BILLED,
    label: 'Facturé',
    color: '#1f28dd',
    apiKey: 'billed'
  }
];

export interface Action {
  actionLabel: ACTIONS_VALUES;
  actionStart: Array<Status>;
  actionEnd: Status;
  authorizedRoles: Array<UserRole>;
}

export enum ACTIONS_VALUES {
  PUBLISH = 'Publier',
  DELETE = 'Supprimer',
  RESTORE = 'Restaurer',
  CLOSE = 'Clôturer',
  REQUEST_APPROVAL = 'Demander la validation',
}

export const ACTIONS: Array<Action> = [
  {
    actionLabel: ACTIONS_VALUES.PUBLISH,
    actionStart: [
      STATUS.find((s: Status) => s.key === STATUS_VALUES.DRAFT)!,
      STATUS.find((s: Status) => s.key === STATUS_VALUES.WAITING_APPROVAL)!,
    ],
    actionEnd: STATUS.find((s: Status) => s.key === STATUS_VALUES.PUBLISHED)!,
    authorizedRoles: ['AdminEditor', 'Admin', 'KlubMemberLeader']
  },
  {
    actionLabel: ACTIONS_VALUES.DELETE,
    actionStart: [
      STATUS.find((s: Status) => s.key === STATUS_VALUES.DRAFT)!,
      STATUS.find((s: Status) => s.key === STATUS_VALUES.WAITING_APPROVAL)!,
      STATUS.find((s: Status) => s.key === STATUS_VALUES.PUBLISHED)!,
    ],
    actionEnd: STATUS.find((s: Status) => s.key === STATUS_VALUES.DELETED)!,
    authorizedRoles: ['AdminEditor', 'Admin', 'KlubMemberLeader']
  },
  {
    actionLabel: ACTIONS_VALUES.RESTORE,
    actionStart: [
      STATUS.find((s: Status) => s.key === STATUS_VALUES.CLOSED)!,
      // STATUS.find((s: Status) => s.key === STATUS_VALUES.DELETED)!,
    ],
    actionEnd: STATUS.find((s: Status) => s.key === STATUS_VALUES.PUBLISHED)!,
    authorizedRoles: ['AdminEditor', 'Admin', 'KlubMemberLeader']
  },
  {
    actionLabel: ACTIONS_VALUES.CLOSE,
    actionStart: [
      STATUS.find((s: Status) => s.key === STATUS_VALUES.PUBLISHED)!,
    ],
    actionEnd: STATUS.find((s: Status) => s.key === STATUS_VALUES.CLOSED)!,
    authorizedRoles: ['AdminEditor', 'Admin', 'KlubMemberLeader']
  },
  {
    actionLabel: ACTIONS_VALUES.REQUEST_APPROVAL,
    actionStart: [
      STATUS.find((s: Status) => s.key === STATUS_VALUES.DRAFT)!,
    ],
    actionEnd: STATUS.find((s: Status) => s.key === STATUS_VALUES.WAITING_APPROVAL)!,
    authorizedRoles: ['KlubMember']
  },
]

export interface ActionConfirmation {
  key: ACTION_CONFIRMATION_VALUES;
  label: string;
  buttonLabel: string;
  toastLabel: string;
}

export enum ACTION_CONFIRMATION_VALUES {
  PUBLISH = 'PUBLISH',
  DELETE = 'DELETE',
  REQUEST_APPROVAL = 'REQUEST_APPROVAL',
  RESTORE = 'RESTORE',
  CLOSE = 'CLOSE',
}

export const ACTION_CONFIRMATION: Array<ActionConfirmation> = [
  {
    key: ACTION_CONFIRMATION_VALUES.PUBLISH,
    label: 'publier',
    buttonLabel: 'PUBLIER',
    toastLabel: 'Publication'
  },
  {
    key: ACTION_CONFIRMATION_VALUES.DELETE,
    label: 'supprimer',
    buttonLabel: 'SUPPRIMER',
    toastLabel: 'Suppression'
  },
  {
    key: ACTION_CONFIRMATION_VALUES.REQUEST_APPROVAL,
    label: 'demander la validation de',
    buttonLabel: 'DEMANDER LA VALIDATION',
    toastLabel: 'Demande de validation'
  },
  {
    key: ACTION_CONFIRMATION_VALUES.RESTORE,
    label: 'restorer',
    buttonLabel: 'RESTAURER',
    toastLabel: 'Restauration'
  },
  {
    key: ACTION_CONFIRMATION_VALUES.CLOSE,
    label: 'clôturer',
    buttonLabel: 'CLÔTURER',
    toastLabel: 'Clôture'
  },
];
