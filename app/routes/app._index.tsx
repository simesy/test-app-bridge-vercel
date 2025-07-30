import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  return (
    <Page>
      <TitleBar title="Diggers Shopify Admin Tools">
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Admin Tools Menu
                </Text>
                <List>
                  <List.Item>
                    <Link to="/app/xml-export" style={{ textDecoration: 'none' }}>
                      <Text as="span" variant="bodyMd" tone="base">
                        XML Export
                      </Text>
                    </Link>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
