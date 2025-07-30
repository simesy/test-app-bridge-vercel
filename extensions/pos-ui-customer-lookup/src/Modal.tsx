import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Text,
  Screen,
  ScrollView,
  Selectable,
  SearchBar,
  Spacing,
  Stack,
  reactExtension,
  useApi,
} from '@shopify/ui-extensions-react/point-of-sale'

const SmartGridModal = () => {
  const { query, cart } = useApi();
  const [q, setQ] = useState('');
  const [customers, setCustomers] = useState<any>([])
  const [loading, setLoading] = useState(false)

  const doSearch = async () => {
    setLoading(true)
    const gql = `{
      customers(first: 20, query: "${q}") {
        edges {
          node {
            id
            displayName
            email
            phone
            defaultAddress {
              zip
              province
            }
            isMember: metafield(namespace: "customer", key: "is_member") {
              value
            }
            expiryDate: metafield(namespace: "customer", key: "expiry_date_membership") {
              value
            }
          }
        }
      }
    }`
    const res = await query(gql)
    const customerNodes: any[] = [];
    for (const edge of res.data.customers.edges) {
      let statusIcon = "";
      if (edge.node?.isMember?.value === 'true') {
        statusIcon = "🌻";
      }
      else if (edge.node?.expiryDate?.value) {
        statusIcon = "💤";
      }       
      edge.node.statusIcon = statusIcon
      edge.node.numericId = edge.node.id.split('/').pop()
      console.log(edge.node);
      customerNodes.push(edge.node)
    }
    setCustomers(customerNodes)
    setLoading(false)
  };

  return (
    <Screen name="CustomerLookupModal" title="Member Lookup">
      <Stack direction="block" alignContent="stretch" paddingInline="250">
        <Stack direction="inline" padding="100" justifyContent="space-between" columnGap="300">
          <Box inlineSize="450px">
            <SearchBar
              onSearch={doSearch}
              onTextChange={setQ}
              editable
              placeholder={`Search or scan …`}
            />
          </Box>
          <Box inlineSize="200px">
            <Button title="Search" type="primary" onPress={doSearch}></Button>
          </Box>
        </Stack>

        <ScrollView>
          <Stack direction="block" alignContent="stretch" rowGap="300">
            {loading && (
              <Text>Searching customers … "{q}"</Text>
            )}
            {!loading && customers.length === 0 && q && (
              <Text>No customers found for "{q}"</Text>
            )}
            {!loading && customers.length === 0 && !q && (
              <Text>Enter a search term to find customers</Text>
            )}
          </Stack>
 
          <Stack direction="inline" paddingBlockStart="200">            
            {customers.map((customer: any) => (
              <Selectable
                key={customer.id}
                onPress={() => cart.setCustomer({id: Number(customer.numericId)})}
              >              
                <Box padding="100" paddingBlockEnd="300" inlineSize="300px">
                  <Text variant="headingSmall">{customer.displayName} {customer.statusIcon}</Text>
                  <Text>{customer.email || "—"}</Text>
                  <Text>{customer.phone || "—"}</Text>
                  <Text>{(customer?.defaultAddress?.zip || customer?.defaultAddress?.province) ? `${customer?.defaultAddress?.province} ${customer?.defaultAddress?.zip}` : "Location unknown"}</Text>
                  <Text>{customer?.expiryDate?.value ? `Expiry: ${customer.expiryDate.value}` : ""}</Text>
                </Box>
              </Selectable>                
            ))} 
          </Stack>
        </ScrollView>
      </Stack>
    </Screen>
  )

}

export default reactExtension(
  'pos.home.modal.render',
  () => <SmartGridModal />
);
