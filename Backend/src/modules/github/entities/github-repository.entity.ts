export class GithubRepository {
  id!: number;
  name!: string;
  fullName!: string;
  private!: boolean;
  default_branch!: string;
  owner!: {
    login: string;
    avatarUrl: string;
  };
}
