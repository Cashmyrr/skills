/**
 * Complete App Card Example — HubSpot Platform 2025.2
 *
 * File: src/app/cards/ContactEnrichment.jsx
 * Config: src/app/cards/contact-enrichment-hsmeta.json
 *
 * This example shows:
 * - Fetching CRM properties with useCrmProperties hook
 * - Fetching external data with hubspot.fetch()
 * - Alert actions
 * - Modal overlay
 * - TypeScript generics (works as .tsx too)
 */

import React, { useState } from "react";
import {
  hubspot,
  Flex,
  Text,
  Button,
  LoadingSpinner,
  Alert,
  Modal,
  ModalBody,
  ModalFooter,
  Divider,
  useExtensionApi,
} from "@hubspot/ui-extensions";
import { useCrmProperties } from "@hubspot/ui-extensions/crm";

// Register the extension for the crm.record.tab location
hubspot.extend(() => <ContactEnrichment />);

const ContactEnrichment = () => {
  const { context, actions } = useExtensionApi();
  const { properties, isLoading: propsLoading } = useCrmProperties([
    "firstname",
    "lastname",
    "email",
    "company",
  ]);

  const [enrichData, setEnrichData] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState(null);

  const enrichContact = async () => {
    setIsEnriching(true);
    setEnrichError(null);

    try {
      const response = await hubspot.fetch(
        `https://api.example.com/enrich?email=${properties.email}`,
        { method: "GET", timeout: 10000 }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setEnrichData(data);

      actions.addAlert({
        type: "success",
        title: "Enrichment Complete",
        message: `Found data for ${properties.firstname} ${properties.lastname}`,
      });
    } catch (err) {
      setEnrichError(err.message);
      actions.addAlert({
        type: "danger",
        title: "Enrichment Failed",
        message: err.message,
      });
    } finally {
      setIsEnriching(false);
    }
  };

  if (propsLoading) {
    return <LoadingSpinner label="Loading contact data..." />;
  }

  return (
    <Flex direction="column" gap="medium">
      <Text format={{ fontWeight: "demibold" }}>
        {properties.firstname} {properties.lastname}
      </Text>
      <Text>{properties.email}</Text>
      {properties.company && <Text variant="microcopy">{properties.company}</Text>}

      <Divider />

      {enrichError && (
        <Alert type="danger" title="Error">
          {enrichError}
        </Alert>
      )}

      {enrichData && (
        <Flex direction="column" gap="small">
          <Text format={{ fontWeight: "demibold" }}>Enriched Data</Text>
          <Text>LinkedIn: {enrichData.linkedin || "N/A"}</Text>
          <Text>Title: {enrichData.title || "N/A"}</Text>
        </Flex>
      )}

      <Flex gap="small">
        <Button
          variant="primary"
          onClick={enrichContact}
          disabled={isEnriching || !properties.email}
        >
          {isEnriching ? "Enriching..." : "Enrich Contact"}
        </Button>

        <Button
          variant="secondary"
          overlay={
            <Modal id="details-modal" title="Contact Details" width="md">
              <ModalBody>
                <Flex direction="column" gap="small">
                  <Text>Portal: {context.portal.id}</Text>
                  <Text>User: {context.user.email}</Text>
                  <Text>Record ID: {context.crm?.objectId}</Text>
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button onClick={() => actions.closeOverlay("details-modal")}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          }
        >
          View Details
        </Button>
      </Flex>
    </Flex>
  );
};
