export type Environment = {
  pods: Pod[];
  services: Service[];
  logs: string[];
};

export type Pod = {
  name: string;
  phase: string;
  createdAt: Date;
};

export type Service = {
  name: string;
  ip: string;
  port: number;
};
