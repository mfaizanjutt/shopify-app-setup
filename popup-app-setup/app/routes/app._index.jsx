import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const variantId =
    responseJson.data.productCreate.product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
      mutation updateVariant($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant {
            id
            price
            barcode
            createdAt
          }
        }
      }`,
    {
      variables: {
        input: {
          id: variantId,
          price: Math.random() * 100,
        },
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return json({
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantUpdate.productVariant,
  });
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <ui-title-bar title="Webguru Popup"></ui-title-bar>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis odio
        obcaecati unde assumenda? Hic vero atque iusto voluptatibus quas?
        Sapiente assumenda minima harum? Ab iste, exercitationem expedita
        dolorem suscipit inventore!
      </p>
      <div
        className="mine"
        style={{
          display: "flex",
          marginTop: "50px",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "50px",
        }}
      >
        <h1>M Faizan </h1>
        <button>Click Me</button>
      </div>

      <div
        className="box"
        style={{
          display: "flex",
          marginTop: "50px",
          justifyContent: "space-between",
        }}
      >
        <div
          className="box1"
          style={{ backgroundColor: "red", padding: "20px" }}
        >
          this is a Box 1
        </div>
        <div className="box2">Box 2</div>
        <div className="box3">Box 3</div>
        <div className="box3">Box 3</div>
      </div>
    </Page>
  );
}
