import { Injectable } from '@nestjs/common';
import { AppsV1Api, CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { spawnSync } from 'child_process';
import { InjectRepository } from '@nestjs/typeorm';
import { Environment } from './k8s.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class K8sService {
  private readonly kubeConfig: KubeConfig;
  private readonly kubeApi: CoreV1Api;
  private readonly kubeAppsApi: AppsV1Api;
  private readonly isK8sClusterConnected: boolean;
  constructor(
    @InjectRepository(Environment)
    private environmentRepository: Repository<Environment>,
  ) {
    this.kubeConfig = new KubeConfig();
    this.kubeConfig.loadFromFile(`../kube-view/kube-view/config.yaml`);

    this.kubeApi = this.kubeConfig.makeApiClient(CoreV1Api);
    this.kubeAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
    this.isK8sClusterConnected = this.kubeApi.listNamespacedPod('default')
      ? true
      : false;
  }

  createNameSpaceName(owner: string, repo: string, pull: number, id: number) {
    return `${owner.toLocaleLowerCase()}-${repo.toLocaleLowerCase()}-${pull}-${id}`;
  }

  async createNamescape(namespace: string) {
    if (this.isK8sClusterConnected) {
      try {
        return this.kubeApi.createNamespace({
          metadata: {
            name: namespace,
          },
        });
      } catch (error) {
        console.log(error);

        console.log(`Error creating namespace ${namespace}`);
      }
    }
  }

  async createEnvironment(
    owner: string,
    repo: string,
    pull: number,
    namespace: string,
    kubernetesYamlString: string,
    id: number,
  ) {
    try {
      const listNamespaces = await this.kubeApi.listNamespace();

      if (
        !listNamespaces.body.items.some(
          (item) => item.metadata.name === namespace,
        )
      ) {
        await this.createNamescape(namespace);
      }

      // Execute kubectl apply -f - with the output of echo as input
      const kubectlProcess = spawnSync(
        'kubectl',
        ['apply', '-n', namespace, '-f', '-'],
        {
          input: kubernetesYamlString,
        },
      );

      if (kubectlProcess.error) {
        console.error(
          `Error executing kubectl apply: ${kubectlProcess.output}`,
        );
      }
      const environment = new Environment();
      const user = new User();
      user.username = owner;
      user.id = id;
      environment.namespace = namespace;
      environment.repo = repo;
      environment.pull = parseInt(pull.toString());
      environment.username = user;
      console.log(environment, user);
      if (
        !(await this.environmentRepository.findOneBy({ namespace: namespace }))
      ) {
        await this.environmentRepository.save(environment);
      }
      console.log(`kubectl apply output: ${kubectlProcess.output}`);
      // return response;
    } catch (error) {
      console.log(error);

      console.log(`Error while creating deployment in namespace ${namespace}`);
    }
  }

  async getPublicIpAddress(namespace: string) {
    const services = await this.kubeApi.listNamespacedService(namespace);
    console.log('service:', JSON.stringify(services));
    const resultArray = services.body.items.map((item) => ({
      name: item.metadata.name,
      ip: item.status.loadBalancer.ingress?.[0].ip,
      port: item.spec.ports[0].port,
    }));
    return resultArray;
  }

  async getPodsDetail(namespace: string) {
    const pods = await this.kubeApi.listNamespacedPod(namespace);
    console.log('PODS: ---------', JSON.stringify(pods));

    return pods.body.items.map((item) => ({
      name: item.metadata.name,
      phase: item.status.phase,
      createdAt: item.status.startTime,
    }));
  }
  async getPodLogs(
    podName: string,
    owner: string,
    id: number,
    repo: string,
    pull: number,
  ) {
    const namespace = await this.createNameSpaceName(owner, repo, pull, id);
    const logStream = await this.kubeApi.readNamespacedPodLog(
      podName,
      namespace,
      undefined,
      false,
    );
    return logStream.body;
  }

  async getEnvironmentsByUser(username: string, id: number) {
    const user = new User();
    user.id = id;
    const namespaces = await this.environmentRepository.find({
      where: {
        username: user,
      },
      relations: {
        username: true,
      },
    });
    const environments = [];
    for (const namespace of namespaces) {
      const environment = await this.getEnvorinmentDetails(
        namespace.username.username,
        namespace.repo,
        namespace.pull,
        namespace.username.id,
      );
      environments.push(environment);
    }
    return environments;
  }

  async getEnvorinmentDetails(
    owner: string,
    repo: string,
    pull: number,
    id: number,
  ) {
    const namespace = this.createNameSpaceName(owner, repo, pull, id);
    const podDetails = await this.getPodsDetail(namespace);
    const servicesDetails = await this.getPublicIpAddress(namespace);
    return {
      pods: podDetails,
      services: servicesDetails,
    };
  }

  async deleteEnviornment(
    owner: string,
    repo: string,
    pull: number,
    id: number,
  ) {
    try {
      const namespace = this.createNameSpaceName(owner, repo, pull, id);
      this.kubeApi.deleteNamespace(namespace);
      return await this.environmentRepository.delete({
        namespace: namespace,
      });
    } catch (error) {
      console.error(`Error while deleting environment.`);
    }
  }
}
