"""
Azure AI Search client — create index schema and retrieve relevant rule chunks.
"""
import os
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SearchIndex,
)
from azure.search.documents.models import VectorizedQuery


INDEX_NAME = os.environ.get("AZURE_SEARCH_INDEX_NAME", "brand-compliance")
VECTOR_DIM  = 384    # all-MiniLM-L6-v2 output dimension


def _credential() -> AzureKeyCredential:
    return AzureKeyCredential(os.environ["AZURE_SEARCH_API_KEY"])


def get_index_client() -> SearchIndexClient:
    return SearchIndexClient(
        endpoint=os.environ["AZURE_SEARCH_ENDPOINT"],
        credential=_credential(),
    )


def get_search_client() -> SearchClient:
    return SearchClient(
        endpoint=os.environ["AZURE_SEARCH_ENDPOINT"],
        index_name=INDEX_NAME,
        credential=_credential(),
    )


def ensure_index() -> None:
    """Create (or recreate) the index with the correct vector schema."""
    client = get_index_client()
    existing = [i.name for i in client.list_indexes()]
    if INDEX_NAME in existing:
        client.delete_index(INDEX_NAME)
        print(f"[search] Dropped old index '{INDEX_NAME}' to recreate with correct schema")

    index = SearchIndex(
        name=INDEX_NAME,
        fields=[
            SimpleField(name="id",       type=SearchFieldDataType.String, key=True, filterable=True),
            SearchableField(name="title",   type=SearchFieldDataType.String),
            SearchableField(name="content", type=SearchFieldDataType.String),
            SimpleField(name="source",   type=SearchFieldDataType.String, filterable=True, facetable=True),
            SimpleField(name="section",  type=SearchFieldDataType.String, filterable=True),
            SimpleField(name="url",      type=SearchFieldDataType.String),
            SimpleField(name="platforms",type=SearchFieldDataType.String, filterable=True),
            SearchField(
                name="content_vector",
                type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                searchable=True,
                vector_search_dimensions=VECTOR_DIM,
                vector_search_profile_name="hnsw-profile",
            ),
        ],
        vector_search=VectorSearch(
            algorithms=[HnswAlgorithmConfiguration(name="hnsw-algo")],
            profiles=[VectorSearchProfile(name="hnsw-profile", algorithm_configuration_name="hnsw-algo")],
        ),
    )
    client.create_index(index)
    print(f"[search] Created index '{INDEX_NAME}'")


def retrieve_rules(query_vector: list[float], platform: str, top_k: int = 8) -> list[dict]:
    """Semantic search: return top_k rule chunks relevant to the content."""
    client = get_search_client()

    vector_query = VectorizedQuery(
        vector=query_vector,
        k_nearest_neighbors=top_k,
        fields="content_vector",
    )

    results = client.search(
        search_text=None,
        vector_queries=[vector_query],
        filter=f"platforms eq 'all' or platforms eq '{platform}'",
        select=["id", "title", "content", "source", "section", "url"],
        top=top_k,
    )

    return [dict(r) for r in results]
