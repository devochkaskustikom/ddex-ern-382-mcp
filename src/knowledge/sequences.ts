/**
 * Canonical ERN 3.8.2 child sequences used for knowledge + smoke checks.
 *
 * Full XSD allows many optional siblings; the lists below are the
 * practice-critical order that schema-valid messages must respect when
 * those elements are present. Derived from ern/382 release-notification.xsd
 * and industry ERN 3.8.2 packaging practice.
 */

export type SequenceMember = {
  name: string
  /** XSD minOccurs === 0 (or inside optional choice) */
  optional: boolean
  /** Mutually exclusive with another member (xs:choice) */
  choiceWith?: string[]
  notes?: string
}

export type ElementSequence = {
  id: string
  /** XML local name of the parent element / complexType */
  parent: string
  title: string
  description: string
  members: SequenceMember[]
  /** Shorter order used by the structural smoke check (present → ordered) */
  smokeOrder: string[]
}

export const SEQUENCES: Record<string, ElementSequence> = {
  NewReleaseMessage: {
    id: 'NewReleaseMessage',
    parent: 'NewReleaseMessage',
    title: 'NewReleaseMessage (root)',
    description:
      'ERN 3.8.2 root. Namespace http://ddex.net/xml/ern/382; MessageSchemaVersionId="ern/382".',
    members: [
      { name: 'MessageHeader', optional: false },
      { name: 'UpdateIndicator', optional: true },
      { name: 'IsBackfill', optional: true },
      { name: 'CatalogTransfer', optional: true },
      { name: 'WorkList', optional: true },
      { name: 'CueSheetList', optional: true },
      { name: 'ResourceList', optional: false },
      { name: 'CollectionList', optional: true },
      { name: 'ReleaseList', optional: false },
      { name: 'DealList', optional: false, notes: 'Required for commercial delivery packages' },
    ],
    smokeOrder: ['MessageHeader', 'ResourceList', 'ReleaseList', 'DealList'],
  },

  ReleaseDetailsByTerritory: {
    id: 'ReleaseDetailsByTerritory',
    parent: 'ReleaseDetailsByTerritory',
    title: 'ReleaseDetailsByTerritory (RDBT)',
    description:
      'Territory-specific release descriptors. PLine/CLine belong HERE, not directly on Release. Contributors at release level live inside ResourceGroup, not as RDBT siblings.',
    members: [
      {
        name: 'TerritoryCode',
        optional: false,
        choiceWith: ['ExcludedTerritoryCode'],
        notes: 'Use ISO codes or Worldwide; choice vs ExcludedTerritoryCode',
      },
      {
        name: 'ExcludedTerritoryCode',
        optional: true,
        choiceWith: ['TerritoryCode'],
      },
      { name: 'DisplayArtistName', optional: true },
      { name: 'LabelName', optional: true },
      { name: 'RightsAgreementId', optional: true },
      {
        name: 'Title',
        optional: true,
        notes: 'Usually TitleType="DisplayTitle"; SubTitle child allowed',
      },
      { name: 'DisplayArtist', optional: true },
      { name: 'IsMultiArtistCompilation', optional: true },
      { name: 'AdministratingRecordCompany', optional: true },
      { name: 'ReleaseType', optional: true },
      { name: 'RelatedRelease', optional: true },
      { name: 'ParentalWarningType', optional: true },
      { name: 'AvRating', optional: true },
      { name: 'MarketingComment', optional: true },
      {
        name: 'ResourceGroup',
        optional: true,
        notes:
          'Release-level ResourceContributor / IndirectResourceContributor live inside ResourceGroup',
      },
      { name: 'Genre', optional: true },
      { name: 'PLine', optional: true },
      { name: 'CLine', optional: true },
      { name: 'ReleaseDate', optional: true },
      { name: 'OriginalReleaseDate', optional: true },
      { name: 'OriginalDigitalReleaseDate', optional: true, notes: 'Deprecated in ERN 3.8.2' },
      { name: 'Keywords', optional: true },
      { name: 'Synopsis', optional: true },
      { name: 'Character', optional: true },
      { name: 'NumberOfUnitsPerPhysicalRelease', optional: true },
      { name: 'DisplayConductor', optional: true },
    ],
    smokeOrder: [
      'TerritoryCode',
      'DisplayArtistName',
      'LabelName',
      'Title',
      'DisplayArtist',
      'ParentalWarningType',
      'ResourceGroup',
      'Genre',
      'PLine',
      'CLine',
      'ReleaseDate',
      'OriginalReleaseDate',
    ],
  },

  SoundRecording: {
    id: 'SoundRecording',
    parent: 'SoundRecording',
    title: 'SoundRecording',
    description:
      'Audio resource. ResourceReference must match A[...]. IsInstrumental before LanguageOfPerformance before Duration. LanguageOfPerformance only when vocal (omit for instrumental).',
    members: [
      { name: 'SoundRecordingType', optional: true },
      { name: 'IsArtistRelated', optional: true },
      { name: 'SoundRecordingId', optional: false, notes: 'ISRC and/or ProprietaryId' },
      { name: 'IndirectSoundRecordingId', optional: true },
      {
        name: 'ResourceReference',
        optional: false,
        notes: 'xs:ID pattern A[\\d\\-_a-zA-Z]+',
      },
      { name: 'ReferenceTitle', optional: false },
      { name: 'InstrumentationDescription', optional: true },
      { name: 'IsMedley', optional: true },
      { name: 'IsPotpourri', optional: true },
      { name: 'IsInstrumental', optional: true },
      { name: 'IsBackground', optional: true },
      { name: 'IsHiddenResource', optional: true },
      { name: 'IsBonusResource', optional: true, notes: 'Deprecated - prefer ResourceGroupContentItem' },
      { name: 'HasPreOrderFulfillment', optional: true },
      { name: 'IsComputerGenerated', optional: true },
      { name: 'IsRemastered', optional: true },
      { name: 'NoSilenceBefore', optional: true },
      { name: 'NoSilenceAfter', optional: true },
      { name: 'PerformerInformationRequired', optional: true },
      {
        name: 'LanguageOfPerformance',
        optional: true,
        notes: 'Omit when IsInstrumental=true; ISO 639-2. Must come after IsInstrumental and before Duration.',
      },
      {
        name: 'Duration',
        optional: false,
        notes: 'ISO 8601 duration PT[[hhH]mmM]ssS',
      },
      { name: 'RightsAgreementId', optional: true },
      { name: 'SoundRecordingCollectionReferenceList', optional: true },
      { name: 'ResourceMusicalWorkReferenceList', optional: true },
      {
        name: 'ResourceContainedResourceReferenceList',
        optional: true,
        notes: 'Link lyrics Text resources, etc.',
      },
      { name: 'CreationDate', optional: true },
      { name: 'MasteredDate', optional: true },
      { name: 'RemasteredDate', optional: true },
      { name: 'SoundRecordingDetailsByTerritory', optional: false },
      { name: 'TerritoryOfCommissioning', optional: true },
      { name: 'NumberOfFeaturedArtists', optional: true },
      { name: 'NumberOfNonFeaturedArtists', optional: true },
      { name: 'NumberOfContractedArtists', optional: true },
      { name: 'NumberOfNonContractedArtists', optional: true },
    ],
    smokeOrder: [
      'SoundRecordingType',
      'SoundRecordingId',
      'ResourceReference',
      'ReferenceTitle',
      'IsInstrumental',
      'LanguageOfPerformance',
      'Duration',
      'ResourceContainedResourceReferenceList',
      'SoundRecordingDetailsByTerritory',
    ],
  },

  SoundRecordingDetailsByTerritory: {
    id: 'SoundRecordingDetailsByTerritory',
    parent: 'SoundRecordingDetailsByTerritory',
    title: 'SoundRecordingDetailsByTerritory (SDBT)',
    description:
      'Territory-specific sound recording descriptors. Contributors (Resource / Indirect) sit here at track level.',
    members: [
      {
        name: 'TerritoryCode',
        optional: false,
        choiceWith: ['ExcludedTerritoryCode'],
      },
      {
        name: 'ExcludedTerritoryCode',
        optional: true,
        choiceWith: ['TerritoryCode'],
      },
      { name: 'Title', optional: true, notes: 'DisplayTitle for the territory' },
      { name: 'DisplayArtist', optional: true },
      { name: 'DisplayConductor', optional: true },
      {
        name: 'ResourceContributor',
        optional: true,
        notes: 'Producer, engineers, featured, etc.',
      },
      {
        name: 'IndirectResourceContributor',
        optional: true,
        notes: 'Composer, Lyricist, ComposerLyricist',
      },
      { name: 'RightsAgreementId', optional: true },
      { name: 'DisplayArtistName', optional: true },
      { name: 'LabelName', optional: true },
      { name: 'RightsController', optional: true },
      { name: 'RemasteredDate', optional: true },
      { name: 'ResourceReleaseDate', optional: true },
      { name: 'OriginalResourceReleaseDate', optional: true },
      { name: 'PLine', optional: true },
      { name: 'CourtesyLine', optional: true },
      { name: 'SequenceNumber', optional: true },
      { name: 'HostSoundCarrier', optional: true },
      { name: 'MarketingComment', optional: true },
      { name: 'Genre', optional: true },
      { name: 'ParentalWarningType', optional: true },
      { name: 'AvRating', optional: true },
      { name: 'TechnicalSoundRecordingDetails', optional: true },
      { name: 'FulfillmentDate', optional: true },
      { name: 'Keywords', optional: true },
      { name: 'Synopsis', optional: true },
    ],
    smokeOrder: [
      'TerritoryCode',
      'Title',
      'DisplayArtist',
      'ResourceContributor',
      'IndirectResourceContributor',
      'PLine',
      'Genre',
      'ParentalWarningType',
      'TechnicalSoundRecordingDetails',
    ],
  },

  Release: {
    id: 'Release',
    parent: 'Release',
    title: 'Release',
    description:
      'Release composite. Release-level PLine/CLine exist on Release in the XSD, but common ERN 3.8.2 packaging puts them inside ReleaseDetailsByTerritory. GlobalReleaseDate / GlobalOriginalReleaseDate come after RDBT. ReleaseResourceReferenceList comes before ReleaseType.',
    members: [
      { name: 'ReleaseId', optional: false, notes: 'ICPN (UPC/EAN) and/or GRid / ISRC / ProprietaryId' },
      { name: 'ReleaseReference', optional: true, notes: 'LocalReleaseAnchor pattern R[...], e.g. R0' },
      { name: 'ExternalResourceLink', optional: true },
      { name: 'SalesReportingProxyReleaseId', optional: true },
      { name: 'ReferenceTitle', optional: false },
      { name: 'ReleaseResourceReferenceList', optional: true },
      { name: 'ResourceOmissionReason', optional: true },
      { name: 'ReleaseCollectionReferenceList', optional: true },
      { name: 'ReleaseType', optional: true, notes: 'Album, Single, EP, UserDefined(Compilation), …' },
      { name: 'ReleaseDetailsByTerritory', optional: false },
      { name: 'LanguageOfPerformance', optional: true },
      { name: 'LanguageOfDubbing', optional: true },
      { name: 'SubTitleLanguage', optional: true },
      { name: 'Duration', optional: true },
      { name: 'RightsAgreementId', optional: true },
      {
        name: 'PLine',
        optional: true,
        notes: 'XSD allows it here; packaging practice usually puts PLine inside RDBT instead',
      },
      {
        name: 'CLine',
        optional: true,
        notes: 'XSD allows it here; packaging practice usually puts CLine inside RDBT instead',
      },
      { name: 'ArtistProfilePage', optional: true },
      { name: 'GlobalReleaseDate', optional: true },
      { name: 'GlobalOriginalReleaseDate', optional: true },
    ],
    smokeOrder: [
      'ReleaseId',
      'ReleaseReference',
      'ReferenceTitle',
      'ReleaseResourceReferenceList',
      'ReleaseType',
      'ReleaseDetailsByTerritory',
      'GlobalReleaseDate',
      'GlobalOriginalReleaseDate',
    ],
  },

  DealTerms: {
    id: 'DealTerms',
    parent: 'DealTerms',
    title: 'DealTerms',
    description:
      'Commercial terms under ReleaseDeal/Deal. XSD order: model → Usage/TakeDown choice → territory choice → DistributionChannel choice → ValidityPeriod → PreOrderReleaseDate → preview-date sequence. DistributionChannel is BEFORE ValidityPeriod.',
    members: [
      { name: 'IsPreOrderDeal', optional: true },
      { name: 'CommercialModelType', optional: true, notes: 'e.g. SubscriptionModel; minOccurs 0 in XSD' },
      {
        name: 'Usage',
        optional: false,
        choiceWith: ['AllDealsCancelled', 'TakeDown'],
        notes: 'Choice group: Usage, or deprecated AllDealsCancelled, or deprecated TakeDown',
      },
      { name: 'AllDealsCancelled', optional: true, choiceWith: ['Usage', 'TakeDown'], notes: 'Deprecated' },
      { name: 'TakeDown', optional: true, choiceWith: ['Usage', 'AllDealsCancelled'], notes: 'Deprecated boolean inside the message; package takedown is BatchComplete DeliveryType' },
      {
        name: 'TerritoryCode',
        optional: false,
        choiceWith: ['ExcludedTerritoryCode'],
      },
      {
        name: 'ExcludedTerritoryCode',
        optional: true,
        choiceWith: ['TerritoryCode'],
      },
      {
        name: 'DistributionChannel',
        optional: true,
        choiceWith: ['ExcludedDistributionChannel'],
        notes: 'PartyId = shop id; TradingName optional. Before ValidityPeriod.',
      },
      {
        name: 'ExcludedDistributionChannel',
        optional: true,
        choiceWith: ['DistributionChannel'],
      },
      { name: 'PriceInformation', optional: true },
      { name: 'IsPromotional', optional: true },
      { name: 'PromotionalCode', optional: true },
      { name: 'ValidityPeriod', optional: true, notes: 'StartDate / EndDate' },
      { name: 'ConsumerRentalPeriod', optional: true },
      { name: 'PreOrderReleaseDate', optional: true },
      { name: 'PreOrderPreviewDate', optional: true },
      { name: 'PreOrderPreviewDateTime', optional: true },
      { name: 'PreOrderIncentiveResourceList', optional: true },
      { name: 'InstantGratificationResourceList', optional: true },
      { name: 'IsExclusive', optional: true },
      { name: 'RelatedReleaseOfferSet', optional: true },
      { name: 'PhysicalReturns', optional: true },
      { name: 'NumberOfProductsPerCarton', optional: true },
      { name: 'RightsClaimPolicy', optional: true },
      { name: 'WebPolicy', optional: true },
      {
        name: 'ReleaseDisplayStartDate',
        optional: true,
        notes: 'Inside a later choice sequence together with the three preview dates (or the *DateTime variants)',
      },
      { name: 'TrackListingPreviewStartDate', optional: true },
      { name: 'CoverArtPreviewStartDate', optional: true },
      { name: 'ClipPreviewStartDate', optional: true },
    ],
    smokeOrder: [
      'IsPreOrderDeal',
      'CommercialModelType',
      'Usage',
      'TerritoryCode',
      'DistributionChannel',
      'ValidityPeriod',
      'PreOrderReleaseDate',
      'ReleaseDisplayStartDate',
      'TrackListingPreviewStartDate',
      'CoverArtPreviewStartDate',
      'ClipPreviewStartDate',
    ],
  },

  MessageHeader: {
    id: 'MessageHeader',
    parent: 'MessageHeader',
    title: 'MessageHeader',
    description: 'Message envelope: ids, sender, recipient, created datetime.',
    members: [
      { name: 'MessageThreadId', optional: false },
      { name: 'MessageId', optional: false },
      { name: 'MessageFileName', optional: true },
      { name: 'MessageSender', optional: false },
      { name: 'SentOnBehalfOf', optional: true },
      { name: 'MessageRecipient', optional: false },
      { name: 'MessageCreatedDateTime', optional: false },
      { name: 'MessageAuditTrail', optional: true },
      { name: 'Comment', optional: true },
      { name: 'MessageControlType', optional: true },
    ],
    smokeOrder: [
      'MessageThreadId',
      'MessageId',
      'MessageSender',
      'MessageRecipient',
      'MessageCreatedDateTime',
    ],
  },

  File: {
    id: 'File',
    parent: 'File',
    title: 'File',
    description:
      'ERN 3.8.2 File composite. Choice: (FileName + optional FilePath) OR URL, then optional HashSum. There is NO FileURL and NO FileSize element.',
    members: [
      {
        name: 'FileName',
        optional: true,
        choiceWith: ['URL'],
        notes: 'Required in the FileName branch. Must not contain a path.',
      },
      {
        name: 'FilePath',
        optional: true,
        notes: 'Optional sibling of FileName. Relative directory only, no file name.',
      },
      {
        name: 'URL',
        optional: true,
        choiceWith: ['FileName'],
        notes: 'Alternative to FileName+FilePath. Often relative ./ICPN/...',
      },
      { name: 'HashSum', optional: true, notes: 'After the choice: HashSum + HashSumAlgorithmType (MD5)' },
    ],
    smokeOrder: ['FileName', 'FilePath', 'HashSum'],
  },

  BatchComplete_MessageInBatch: {
    id: 'BatchComplete_MessageInBatch',
    parent: 'MessageInBatch',
    title: 'BatchComplete / MessageInBatch',
    description:
      'Package manifest entry (not inside NewReleaseMessage). Must be filled; relative URL; DeliveryType; MD5 of the message file. Upload BatchComplete last.',
    members: [
      { name: 'MessageType', optional: false, notes: 'NewReleaseMessage' },
      { name: 'MessageId', optional: false },
      { name: 'URL', optional: false, notes: 'Relative path to the ERN XML' },
      { name: 'IncludedReleaseId', optional: false, notes: 'ICPN (+ ProprietaryId)' },
      {
        name: 'DeliveryType',
        optional: false,
        notes: 'NewReleaseDelivery | ReDelivery | TakeDown',
      },
      { name: 'ProductType', optional: true, notes: 'AudioProduct for music' },
      { name: 'HashSum', optional: false },
    ],
    smokeOrder: [
      'MessageType',
      'MessageId',
      'URL',
      'IncludedReleaseId',
      'DeliveryType',
      'ProductType',
      'HashSum',
    ],
  },
}

export function listSequences(): Array<{ id: string; parent: string; title: string }> {
  return Object.values(SEQUENCES).map((s) => ({
    id: s.id,
    parent: s.parent,
    title: s.title,
  }))
}

export function getSequence(name: string): ElementSequence | undefined {
  const key = name.trim()
  if (SEQUENCES[key]) return SEQUENCES[key]
  const lower = key.toLowerCase()
  return Object.values(SEQUENCES).find(
    (s) =>
      s.id.toLowerCase() === lower ||
      s.parent.toLowerCase() === lower ||
      s.title.toLowerCase().includes(lower),
  )
}