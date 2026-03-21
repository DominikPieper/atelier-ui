import { createStorybookMcpHandler } from '@storybook/mcp';

const handler = createStorybookMcpHandler({
  manifestProvider: async (_request, path) => {
    const siteUrl = Netlify.env.get('URL') ?? 'http://localhost:4321';
    const fileName = path.split('/').pop() ?? 'components.json';
    const url = `${siteUrl}/storybook-angular/manifests/${fileName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }
    return response.text();
  },
});

export default async function (request: Request): Promise<Response> {
  return (await handler)(request);
}
