import { Client } from '@elastic/elasticsearch';

const elasticClient = new Client({
  node: `http://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`
});

const checkElasticsearchConnection = async (): Promise => {
  try {
    const info = await elasticClient.info();
    console.log('Elasticsearch connected:', info.body.version.number);
  } catch (error) {
    console.error('Elasticsearch connection error:', error);
  }
};

export { elasticClient, checkElasticsearchConnection };