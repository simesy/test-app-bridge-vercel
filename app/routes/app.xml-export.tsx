import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import type { Product as ShopifyProduct } from "@shopify/app-bridge-types";
import {
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Page,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

type Product = ShopifyProduct;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("OK got here");

  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedProductIds = JSON.parse(formData.get("selectedProducts") as string);

  // Fetch product details for selected products
  const response = await admin.graphql(
    `#graphql
      query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            handle
          }
        }
      }`,
    {
      variables: {
        ids: selectedProductIds,
      },
    }
  );

  const responseJson = await response.json();
  const products = responseJson.data.nodes;

  // Generate XML content
  const xmlContent = generateXML(products);

  return new Response(xmlContent, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": "attachment; filename=products-export.xml",
    },
  });
};

function generateXML(products: Array<{ id: string; title: string; handle: string }>) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const productsXml = products
    .map(
      (product) => `
    <product>
      <id>${product.id}</id>
      <title><![CDATA[${product.title}]]></title>
      <handle>${product.handle}</handle>
    </product>`
    )
    .join("");

  return `${xmlHeader}
<products>
  ${productsXml}
</products>`;
}

export default function XmlExportHome() {
  const submit = useSubmit();
  const shopify = useAppBridge();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleProductSelection = useCallback(async () => {
    try {
      const selection = await shopify.resourcePicker({
        type: "product",
        multiple: true,
      });

      console.log("Product IDs being selected:", selection);

      if (!selection || selection.length === 0) return;
      setSelectedProducts(selection as Product[]);
    } catch (error) {
      console.log("Product selection cancelled or failed:", error);
    }
  }, [shopify]);

  const handleExportSubmit = useCallback(() => {
    if (selectedProducts.length === 0) {
      return;
    }

    const selectedProductIds = selectedProducts.map((product) => product.id);

    // Log the product IDs
    console.log("Product IDs being exported:", selectedProductIds);
    console.log("About to submit form...");

    const formData = new FormData();
    formData.append("selectedProducts", JSON.stringify(selectedProductIds));

    submit(formData, { method: "post" });
  }, [selectedProducts, submit]);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts((products) =>
      products.filter((product) => product.id !== productId)
    );
  }, []);

  return (
    <Page>
      <TitleBar title="XML Product Export" />
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="500">
            <Text as="h2" variant="headingMd">
              Export Products to XML
            </Text>
            <Text as="p" variant="bodyMd">
              Search and select products to export their titles to an XML file.
            </Text>

            <InlineStack gap="300">
              <Button
                onClick={handleProductSelection}
              >
                {selectedProducts.length > 0 ? "Add More Products" : "Select Products"}
              </Button>

              {selectedProducts.length > 0 && (
                <Button
                  variant="primary"
                  onClick={handleExportSubmit}
                >
                  Export to XML ({selectedProducts.length.toString()} products)
                </Button>
              )}
            </InlineStack>

            {selectedProducts.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    Selected Products ({selectedProducts.length})
                  </Text>
                  <ResourceList
                    resourceName={{ singular: "product", plural: "products" }}
                    items={selectedProducts}
                    renderItem={(product) => {
                      const media = (
                        <Thumbnail
                          source={
                            product.images?.[0]?.originalSrc ||
                            ""
                          }
                          alt={product.images?.[0]?.altText || product.title}
                        />
                      );

                      return (
                        <ResourceItem
                          id={product.id}
                          media={media}
                          accessibilityLabel={`View details for ${product.title}`}
                          onClick={() => { }}
                        >
                          <InlineStack align="space-between">
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {product.title}
                            </Text>
                            <Button
                              variant="plain"
                              onClick={() => removeProduct(product.id)}
                            >
                              Remove
                            </Button>
                          </InlineStack>
                        </ResourceItem>
                      );
                    }}
                  />
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}