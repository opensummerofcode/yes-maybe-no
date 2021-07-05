export enum ApplicantStatus {
  UNDECIDED = 'UNDECIDED',
  YES = 'YES',
  MAYBE = 'MAYBE',
  NO = 'NO'
}

export interface IApplicant {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  response: any;
  status: ApplicantStatus;
  suggestions?: [];
}
