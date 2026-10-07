/**
 * Composition playbooks - how to fill ERN 3.8.2 for common scenarios.
 */

export type HowtoStep = {
  step: number
  title: string
  detail: string
}

export type HowtoGuide = {
  id: string
  title: string
  summary: string
  steps: HowtoStep[]
  pitfalls: string[]
  relatedSequences: string[]
}

export const HOWTOS: Record<string, HowtoGuide> = {
  'new-release-audio': {
    id: 'new-release-audio',
    title: 'Compose a NewReleaseMessage for an audio release',
    summary:
      'Build a schema-ordered ERN 3.8.2 NewReleaseMessage for Single/EP/Album, then wrap it in BatchComplete with NewReleaseDelivery.',
    relatedSequences: [
      'NewReleaseMessage',
      'MessageHeader',
      'SoundRecording',
      'SoundRecordingDetailsByTerritory',
      'Release',
      'ReleaseDetailsByTerritory',
      'DealTerms',
      'BatchComplete_MessageInBatch',
    ],
    steps: [
      {
        step: 1,
        title: 'Root + header',
        detail:
          'ern:NewReleaseMessage with xmlns ern/382 and MessageSchemaVersionId="ern/382". MessageHeader: MessageThreadId, MessageId, MessageSender, MessageRecipient, MessageCreatedDateTime.',
      },
      {
        step: 2,
        title: 'ResourceList - SoundRecordings',
        detail:
          'One SoundRecording per track. SoundRecordingId (ISRC), ResourceReference A1..An, ReferenceTitle, IsInstrumental, LanguageOfPerformance (vocal only), Duration PT…, then SoundRecordingDetailsByTerritory in SDBT order.',
      },
      {
        step: 3,
        title: 'SDBT credits',
        detail:
          'TerritoryCode → Title → DisplayArtist (MainArtist + instrument role) → ResourceContributor (Producer/…) → IndirectResourceContributor (Composer; Lyricist if vocal) → PLine → Genre → ParentalWarningType → TechnicalSoundRecordingDetails/File.',
      },
      {
        step: 4,
        title: 'Cover Image (+ optional lyrics Text)',
        detail:
          'Image FrontCoverImage with ResourceReference A{n+1}. Lyrics as Text TextType=LyricText with A1001+ refs, linked from SoundRecording via ResourceContainedResourceReferenceList. ResourceList order: SoundRecording* then Image then Text*.',
      },
      {
        step: 5,
        title: 'ReleaseList',
        detail:
          'ReleaseId/ICPN, ReleaseReference R0, ReferenceTitle, ReleaseResourceReferenceList (all A… refs), ReleaseType, then RDBT: TerritoryCode → DisplayArtistName → LabelName → Title → DisplayArtist → ParentalWarningType → ResourceGroup → Genre → PLine → CLine → ReleaseDate → OriginalReleaseDate. After RDBT: GlobalReleaseDate / GlobalOriginalReleaseDate.',
      },
      {
        step: 6,
        title: 'DealList',
        detail:
          'ReleaseDeal → Deal → DealTerms in XSD order: IsPreOrderDeal, CommercialModelType, Usage/UseType, TerritoryCode, DistributionChannel(s), ValidityPeriod/StartDate, then PreOrderReleaseDate and the preview-date sequence when preordering.',
      },
      {
        step: 7,
        title: 'Package + BatchComplete',
        detail:
          'Write <ICPN>/<ICPN>.xml and assets with relative paths. BatchComplete MessageInBatch: MessageType NewReleaseMessage, URL ./…, IncludedReleaseId/ICPN, DeliveryType NewReleaseDelivery, ProductType AudioProduct, MD5 of the message XML. Transfer BatchComplete last, FTP binary.',
      },
    ],
    pitfalls: [
      'Putting PLine/CLine directly on Release instead of inside RDBT',
      'Using FileURL (does not exist) instead of URL or FileName+FilePath',
      'ResourceReference not matching A[…]',
      'LanguageOfPerformance on instrumental tracks',
      'Blank BatchComplete or absolute file paths',
      'Wrong child order inside RDBT/SDBT (XSD is sequence-strict)',
    ],
  },

  'vocal-vs-instrumental': {
    id: 'vocal-vs-instrumental',
    title: 'Vocal vs instrumental track',
    summary: 'Flags and credits that change with IsInstrumental.',
    relatedSequences: ['SoundRecording', 'SoundRecordingDetailsByTerritory'],
    steps: [
      {
        step: 1,
        title: 'Instrumental',
        detail:
          'IsInstrumental=true. Omit LanguageOfPerformance. Do not add Lyricist IndirectResourceContributor. DisplayArtist still needs MainArtist + a performer/instrument role.',
      },
      {
        step: 2,
        title: 'Vocal',
        detail:
          'IsInstrumental=false. Set LanguageOfPerformance (ISO 639-2). Add Lyricist (or ComposerLyricist) under IndirectResourceContributor. Composer remains mandatory in common DSP overlays.',
      },
      {
        step: 3,
        title: 'Optional lyrics payload',
        detail:
          'If shipping lyric text: Text/LyricText resource + ResourceContainedResourceReferenceList on the SoundRecording. Keep refs A[…].',
      },
    ],
    pitfalls: [
      'Lyricist present on instrumental track',
      'Missing Lyricist on vocal track (partner gate, not pure XSD)',
      'IsInstrumental placed after Duration (order violation)',
    ],
  },

  redelivery: {
    id: 'redelivery',
    title: 'ReDelivery (update)',
    summary:
      'Same NewReleaseMessage shape; BatchComplete DeliveryType=ReDelivery. Include full current metadata/content the partner expects for the update.',
    relatedSequences: ['BatchComplete_MessageInBatch', 'NewReleaseMessage'],
    steps: [
      {
        step: 1,
        title: 'Message',
        detail:
          'Rebuild a complete valid NewReleaseMessage for the same ICPN (do not invent a different root element for updates).',
      },
      {
        step: 2,
        title: 'BatchComplete',
        detail: 'Set DeliveryType to ReDelivery. Refresh MessageId and HashSum.',
      },
      {
        step: 3,
        title: 'Upload',
        detail: 'Same package rules: relative paths, MD5, BatchComplete last, binary FTP.',
      },
    ],
    pitfalls: [
      'Leaving DeliveryType as NewReleaseDelivery on an update',
      'Stale HashSum after editing the XML',
    ],
  },

  takedown: {
    id: 'takedown',
    title: 'TakeDown',
    summary:
      'BatchComplete DeliveryType=TakeDown for the ICPN. Message still references the release; partner-specific minimal vs full message rules may apply.',
    relatedSequences: ['BatchComplete_MessageInBatch'],
    steps: [
      {
        step: 1,
        title: 'Identify release',
        detail: 'IncludedReleaseId/ICPN must match the live product.',
      },
      {
        step: 2,
        title: 'DeliveryType',
        detail: 'TakeDown in MessageInBatch. Keep ProductType consistent (AudioProduct).',
      },
      {
        step: 3,
        title: 'Validate + ship',
        detail: 'Validate ERN XML if included; ensure BatchComplete hashes and order rules.',
      },
    ],
    pitfalls: ['Wrong ICPN', 'Uploading BatchComplete before assets/message'],
  },

  'explicit-lyrics': {
    id: 'explicit-lyrics',
    title: 'Explicit flag and lyrics resources',
    summary: 'ParentalWarningType and optional LyricText sidecar.',
    relatedSequences: ['SoundRecording', 'ReleaseDetailsByTerritory'],
    steps: [
      {
        step: 1,
        title: 'Track warning',
        detail: 'SDBT ParentalWarningType = Explicit or NotExplicit per track.',
      },
      {
        step: 2,
        title: 'Release warning',
        detail: 'RDBT ParentalWarningType = Explicit if any track is Explicit; else NotExplicit.',
      },
      {
        step: 3,
        title: 'Lyrics file',
        detail:
          'Text resource TextType=LyricText, codec ASCII (or as agreed), File URL relative, HashSum MD5, linked from SoundRecording.',
      },
    ],
    pitfalls: ['Release NotExplicit while a track is Explicit'],
  },

  'preorder-deal': {
    id: 'preorder-deal',
    title: 'Pre-order deal dates',
    summary: 'IsPreOrderDeal and the four preview start dates under DealTerms.',
    relatedSequences: ['DealTerms'],
    steps: [
      {
        step: 1,
        title: 'Flag',
        detail: 'IsPreOrderDeal=true when preorderDate is on or before release StartDate.',
      },
      {
        step: 2,
        title: 'Dates',
        detail:
          'PreOrderReleaseDate plus ReleaseDisplayStartDate, TrackListingPreviewStartDate, CoverArtPreviewStartDate, ClipPreviewStartDate (often all = preorder date). ValidityPeriod/StartDate remains street date.',
      },
    ],
    pitfalls: ['Setting preview dates without IsPreOrderDeal', 'Preorder after street date'],
  },
}

export function listHowtos(): Array<{ id: string; title: string; summary: string }> {
  return Object.values(HOWTOS).map((h) => ({
    id: h.id,
    title: h.title,
    summary: h.summary,
  }))
}

export function getHowto(idOrTopic: string): HowtoGuide | undefined {
  const key = idOrTopic.trim()
  if (HOWTOS[key]) return HOWTOS[key]
  const lower = key.toLowerCase()
  return Object.values(HOWTOS).find(
    (h) =>
      h.id.toLowerCase() === lower ||
      h.title.toLowerCase().includes(lower) ||
      lower
        .split(/\s+/)
        .every((w) => h.summary.toLowerCase().includes(w) || h.id.includes(w)),
  )
}
