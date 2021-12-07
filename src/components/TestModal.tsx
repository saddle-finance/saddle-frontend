import React, { ReactElement } from "react"
import { Button } from "@chakra-ui/react"
import Modal from "./Modal/Modal"
import ModalContent from "./Modal/ModalContent"
import ModalTitle from "./Modal/ModalTitle"

export default function TestModal(): ReactElement {
  return (
    <Modal>
      <ModalTitle title="Modal title" />
      <ModalContent>
        Awesome Material-UI. Material-UI is a React components library for
        faster and easier web development. It follows Material Design from
        Google.
      </ModalContent>
      <Button>confirm</Button>
    </Modal>
  )
}
