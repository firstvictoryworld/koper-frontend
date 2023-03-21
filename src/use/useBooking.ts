import BookingStatusEnum from "@/enums/BookingStatusEnum"

export default function useBooking() {

  const statusColor = (status: number): undefined|string => {
    switch (status) {
      case BookingStatusEnum.PRESENTED_TO_THE_FUND || BookingStatusEnum.INTEGRATED:
        return 'blue'
      case BookingStatusEnum.INTEGRATED:
        return 'blue'
      case BookingStatusEnum.APPROVED || BookingStatusEnum.CONCLUDED:
        return 'green'
      case BookingStatusEnum.CONCLUDED:
        return 'green'
      case BookingStatusEnum.BLOCKED:
        return 'orange'
      case BookingStatusEnum.REJECTED:
        return 'red'
      case BookingStatusEnum.SUSPENDED:
        return 'purple'
      case BookingStatusEnum.DRAFT:
        return 'yellow-darken-1'
    }
  }

  return {
    statusColor,
  }
}
