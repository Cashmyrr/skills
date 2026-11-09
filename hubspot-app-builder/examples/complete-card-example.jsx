/**
 * Complete App Card Example — HubSpot Platform 2026.09, @hubspot/ui-extensions 1.0.1
 * Note: app cards are not supported in user-level apps (see "User-Level Access" in SKILL.md).
 *
 * File: src/app/cards/ContactEnrichment.jsx
 * Config: src/app/cards/contact-enrichment-hsmeta.json
 *
 * This example shows:
 * - Reading the current record with useRecordPropertiesCurrent (v1 hook)
 * - Fetching external data with hubspot.fetch()
 * - Alert actions
 * - Modal overlay
 * - Loading, error and empty states (required on every data view)
 *
 * TypeScript: rename to .tsx and add the location generics:
 *   hubspot.extend<"crm.record.tab">(...) and useExtensionApi<"crm.record.tab">()
 */

import React, { useState } from "react";
import {
  hubspot,
  Stack,
  Flex,
  Text,
  Button,
  LoadingButton,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  Alert,
  Modal,
  ModalBody,
  ModalFooter,
  Divider,
  useExtensionApi,
} from "@hubspot/ui-extensions";
import { useRecordPropertiesCurrent } from "@hubspot/ui-extensions/crm";

// Register the extension (the card's location comes from its -hsmeta.json)
hubspot.extend(() => <ContactEnrichment />);

const ContactEnrichment = () => {
  const { context, actions } = useExtensionApi();
  const {
    properties,
    isLoading: propsLoading,
    error: propsError,
    refetch,
  } = useRecordPropertiesCurrent({
    properties: ["firstname", "lastname", "email", "company"],
  });

  const [enrichData, setEnrichData] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState(null);

  const enrichContact = async () => {
    setIsEnriching(true);
    setEnrichError(null);

    try {
      const response = await hubspot.fetch(
        // Always encode CRM data placed in a URL (or send it in a POST body)
        `https://api.example.com/enrich?email=${encodeURIComponent(properties.email)}`,
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

  if (propsError) {
    return (
      <ErrorState title="Couldn't load this contact">
        <Button onClick={refetch}>Retry</Button>
      </ErrorState>
    );
  }

  if (!properties.email) {
    return (
      <EmptyState title="No email on this contact">
        <Text>Add an email address to enrich this contact.</Text>
      </EmptyState>
    );
  }

  return (
    <Stack gap="medium">
      <Text format={{ fontWeight: "demibold" }}>
        {properties.firstname} {properties.lastname}
      </Text>
      <Text>{properties.email}</Text>
      {properties.company && <Text variant="microcopy">{properties.company}</Text>}

      <Divider />

      {enrichError && (
        <Alert variant="danger" title="Error">
          {enrichError}
        </Alert>
      )}

      {enrichData && (
        <Stack gap="small">
          <Text format={{ fontWeight: "demibold" }}>Enriched Data</Text>
          <Text>LinkedIn: {enrichData.linkedin || "N/A"}</Text>
          <Text>Title: {enrichData.title || "N/A"}</Text>
        </Stack>
      )}

      <Flex direction="row" gap="small">
        {/* LoadingButton prevents double submission during the async call */}
        <LoadingButton variant="primary" onClick={enrichContact} loading={isEnriching}>
          Enrich Contact
        </LoadingButton>

        <Button
          variant="secondary"
          overlay={
            <Modal id="details-modal" title="Contact Details" width="md">
              <ModalBody>
                <Stack gap="small">
                  <Text>Portal: {context.portal.id}</Text>
                  <Text>User: {context.user.email}</Text>
                  <Text>Record ID: {context.crm?.objectId}</Text>
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={() => actions.closeOverlay("details-modal")}>Close</Button>
              </ModalFooter>
            </Modal>
          }
        >
          View Details
        </Button>
      </Flex>
    </Stack>
  );
};
