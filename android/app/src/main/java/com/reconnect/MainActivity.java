package com.reconnect;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import com.github.juliandramirez.rn.useridentity.RNUserIdentityModule;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

    /**
    * Returns the name of the main component registered from JavaScript. This is used to schedule
    * rendering of the component.
    */
    @Override
    protected String getMainComponentName() {
        return "Reconnect";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        RNBootSplash.init(R.drawable.bootsplash, MainActivity.this); // <- display the generated bootsplash.xml drawable over our MainActivity
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if(requestCode == RNUserIdentityModule.INTENT_REQUEST_CODE) {
            RNUserIdentityModule module = 
                this.getReactInstanceManager().getCurrentReactContext().getNativeModule(RNUserIdentityModule.class);
            module.onActivityResult(resultCode, data);
        }
    }  
}
