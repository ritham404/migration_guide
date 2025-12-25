def chunk_code(content, max_chars=10000):
    """
    Splits content into chunks of approximately max_chars.
    Respects line boundaries.
    """
    chunks = []
    lines = content.splitlines(keepends=True)
    current_chunk = []
    current_length = 0
    
    for line in lines:
        if current_length + len(line) > max_chars:
            chunks.append("".join(current_chunk))
            current_chunk = []
            current_length = 0
        current_chunk.append(line)
        current_length += len(line)
        
    if current_chunk:
        chunks.append("".join(current_chunk))
        
    return chunks
