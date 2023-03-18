import { StatusBar } from "expo-status-bar";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Button, StyleSheet, Text, View } from "react-native";
import * as React from "react";

WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri({
  scheme: "myapp",
  path: "redirect",
});

const CLIENT_ID = "";
const CLIENT_SECRET = "";

const discovery = {
  authorizationEndpoint:
    "https://apitest.vipps.no/access-management-1.0/access/oauth2/auth",
  tokenEndpoint:
    "https://apitest.vipps.no/access-management-1.0/access/oauth2/token",
  userInfoEndpoint: "https://apitest.vipps.no/vipps-userinfo-api/userinfo",
  revocationEndpoint:
    "https://apitest.vipps.no/access-management-1.0/access/oauth2/revoke",
  endSessionEndpoint:
    "https://apitest.vipps.no/access-management-1.0/access/oauth2/sessions/logout",
  discoveryDocument: {
    issuer: "https://apitest.vipps.no/access-management-1.0/access/",
    authorization_endpoint:
      "https://apitest.vipps.no/access-management-1.0/access/oauth2/auth",
    token_endpoint:
      "https://apitest.vipps.no/access-management-1.0/access/oauth2/token",
    jwks_uri:
      "https://apitest.vipps.no/access-management-1.0/access/.well-known/jwks.json",
    subject_types_supported: ["public", "pairwise"],
    response_types_supported: [
      "code",
      "code id_token",
      "id_token",
      "token id_token",
      "token",
      "token id_token code",
    ],
    claims_supported: ["sub"],
    grant_types_supported: ["authorization_code", "client_credentials"],
    response_modes_supported: ["query", "fragment"],
    userinfo_endpoint: "https://apitest.vipps.no/vipps-userinfo-api/userinfo",
    scopes_supported: [
      "offline_access",
      "offline",
      "openid",
      "address",
      "name",
      "email",
      "phoneNumber",
      "nnin",
      "nin",
      "birthDate",
      "accountNumbers",
      "api_version_2",
      "promotions",
    ],
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],
    userinfo_signing_alg_values_supported: ["none"],
    id_token_signing_alg_values_supported: ["RS256"],
    request_parameter_supported: true,
    request_uri_parameter_supported: true,
    require_request_uri_registration: true,
    claims_parameter_supported: false,
    revocation_endpoint:
      "https://apitest.vipps.no/access-management-1.0/access/oauth2/revoke",
    backchannel_logout_supported: false,
    backchannel_logout_session_supported: false,
    frontchannel_logout_supported: false,
    frontchannel_logout_session_supported: false,
    end_session_endpoint:
      "https://apitest.vipps.no/access-management-1.0/access/oauth2/sessions/logout",
    request_object_signing_alg_values_supported: ["none"],
    code_challenge_methods_supported: ["plain", "S256"],
    backchannel_token_delivery_modes_supported: ["poll"],
    backchannel_authentication_endpoint:
      "https://apitest.vipps.no/vipps-login-ciba/api/backchannel/authentication",
  },
};

export default function App() {
  // "https://apitest.vipps.no/access-management-1.0/access/"
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      scopes: ["name", "email"],
      state: "vipps-expo-test",
      extraParams: {
        app_callback_uri: "myapp://redirect",
        requested_flow: "app_to_app",
      },
      redirectUri: "myapp://redirect",
    },
    discovery
  );

  const { token, exchangeError } = useAutoExchange(response?.params.code);

  React.useEffect(() => {
    console.log("Exchange error", exchangeError);
    if (token) {
      console.log("My token", token);
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>{redirectUri}</Text>
      <Button
        title="Login with Vipps"
        disabled={!request}
        onPress={() => promptAsync()}
      />
      {response && <Text>{JSON.stringify(response, null, 2)}</Text>}
      <Button
        title="Get user info"
        onPress={() => fetchVippsUserInfo(response.params.code)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

function useAutoExchange(code) {
  const [state, setState] = React.useReducer(
    (state, action) => ({ ...state, ...action }),
    { token: null, exchangeError: null }
  );
  const isMounted = useMounted();

  React.useEffect(() => {
    console.log("calling with code", code);
    if (!code) {
      setState({ token: null, exchangeError: null });
      return;
    }

    AuthSession.exchangeCodeAsync(
      {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        code,
        redirectUri: "myapp://redirect",
      },
      discovery
    )
      .then((token) => {
        if (isMounted.current) {
          setState({ token, exchangeError: null });
        }
      })
      .catch((exchangeError) => {
        console.log("error", exchangeError);
        if (isMounted.current) {
          setState({ exchangeError, token: null });
        }
      });
  }, [code]);

  return state;
}

function useMounted() {
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}
