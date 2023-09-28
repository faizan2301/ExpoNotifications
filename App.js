import { View, Text, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import PushNotification, { Importance } from "react-native-push-notification";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});
const App = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // creatingChannel();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const { notification, messageId } = remoteMessage;
      console.log(remoteMessage);
      // console.log(notification.body, notification.title);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { data: "goes here" },
        },
        trigger: { seconds: 1 },
      });
      // PushNotification.localNotification({
      //   channelId: "mgsdelivery",
      //   id: messageId,
      //   body: `${notification?.body}`,
      //   title: `${notification?.title}`,
      //   soundName: "default",
      //   vibrate: true,
      //   playSound: true,
      //   priority: "high",
      //   allowWhileIdle: true,
      //   invokeApp: true,
      //   repeatType: "day",
      // });
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          console.log(token);
        });
    }
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          ); // e.g. "Settings"
        }
        setLoading(false);
      });
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      const { notification, messageId } = remoteMessage;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { data: "goes here" },
        },
        trigger: { seconds: 1 },
      });
      console.log("Message handled in the background!", remoteMessage);
    });
    return unsubscribe;
  }, []);
  const creatingChannel = () => {
    PushNotification.createChannel(
      {
        channelId: "mgsdelivery", // (required)
        channelName: "mgsdelivery", // (required)
        channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  };
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
    });

    // Check whether an initial notification is available
  };
  return (
    <View>
      <Text>App</Text>
    </View>
  );
};

export default App;
