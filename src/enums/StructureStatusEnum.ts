enum StructureStatusEnum {
  REJECTED = -2, // se è stata respinta dal fondo
  NOT_APPROVED = -1, // se non è approvato dal fondo
  NOT_COMPLETED = 1, // se presenta dati mancanti
  COMPLETED = 2, // se tutti i dati sono completi
}

export default StructureStatusEnum
