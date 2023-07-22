import React, { useRef } from "react";
import { Divider } from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";

const Receiver = () => {
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const btnRef = React.useRef();
  return (
    <div className="w-screen">
      <div className="flex flex-col w-2/3 justify-center mx-auto mt-20">
        <div className="w-full">
          <div className="flex justify-between align-middle">
            <div>
              <p className="text-xl text-indigo-500 font-semibold">Channels</p>
            </div>
            <div>
            </div>
          </div>
          <div className="mt-5">
            <Divider />
          </div>
          <div className="w-2/3 flex flex-col justify-center mx-auto">
            <div
              ref={btnRef}
              onClick={onOpen2}
              className="w-full border border-indigo-500 rounded-xl px-5 py-2 cursor-pointer mt-5"
            >
              <p className="text-black font-semibold justify-center text-center">
                0x72D7968514E5e6659CeBB5CABa7E02CFf8eda389
              </p>
            </div>
            <Drawer
              isOpen={isOpen2}
              placement="right"
              onClose={onClose2}
              finalFocusRef={btnRef}
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Channel Details</DrawerHeader>

                <DrawerBody></DrawerBody>

                <DrawerFooter>
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={onClose2}
                    colorScheme="red"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    mr={3}
                    colorScheme="blue"
                  >
                    Withdraw
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receiver;
