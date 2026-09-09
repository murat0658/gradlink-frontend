import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from "react-native";

/**
 * Keeps auth/signup forms scrollable above the keyboard.
 * Pair with KeyboardAvoidingView (iOS padding) + ScrollView paddingBottom.
 */
export function useKeyboardAwareForm() {
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const scrollFocusedIntoView = useCallback(
    (_e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
      // Lower fields (password / CTA) need room; end is reliable for short forms.
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, Platform.OS === "ios" ? 80 : 40);
      });
    },
    []
  );

  return {
    scrollRef,
    keyboardVisible,
    /** Extra scroll padding so the focused field / CTA clears the keyboard. */
    bottomPad: keyboardVisible
      ? Math.max(24, Math.round(keyboardHeight * 0.35))
      : 32,
    scrollFocusedIntoView,
  };
}
