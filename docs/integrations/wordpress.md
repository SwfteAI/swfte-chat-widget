# WordPress

You can drop the [Swfte](https://www.swfte.com) chat widget into WordPress two ways:

1. **Quick** — paste a `<script>` snippet via a theme footer hook or a "Custom HTML" block.
2. **Plugin** — ship a tiny self-contained plugin so editors can manage settings from `wp-admin`.

## Option 1 — Snippet via `wp_footer`

Add the following to your child theme's `functions.php` or to a "Code Snippets" plugin:

```php
<?php
add_action( 'wp_footer', function () {
    $agent_id = esc_attr( get_option( 'swfte_agent_id', 'agent-123' ) );
    $base_url = esc_url(  get_option( 'swfte_base_url', 'https://api.swfte.com/agents' ) );
    ?>
    <script src="https://unpkg.com/@swfte/chat-widget@1.1.0/dist/swfte-chat.umd.js"></script>
    <script>
      (function () {
        var client = SwfteChat.createSwfteChatClient({
          baseUrl: <?php echo wp_json_encode( $base_url ); ?>,
          widgetId: <?php echo wp_json_encode( $agent_id ); ?>,
        });
        client.createWidget({ position: 'bottom-right' }).mount(document.body);
      })();
    </script>
    <?php
} );
```

Set the IDs once via WP-CLI:

```bash
wp option update swfte_agent_id "agent-123"
wp option update swfte_base_url "https://api.swfte.com/agents"
```

## Option 2 — Self-contained plugin

Create `wp-content/plugins/swfte-chat/swfte-chat.php`:

```php
<?php
/**
 * Plugin Name: Swfte Chat Widget
 * Description: Embeds the Swfte AI chat widget on every page. Configure under Settings → Swfte Chat.
 * Version:     1.1.0
 * Author:      Swfte
 * Author URI:  https://www.swfte.com
 * License:     MIT
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'admin_menu', function () {
    add_options_page(
        'Swfte Chat',
        'Swfte Chat',
        'manage_options',
        'swfte-chat',
        'swfte_chat_render_settings'
    );
} );

function swfte_chat_render_settings() {
    if ( isset( $_POST['swfte_chat_save'] ) && check_admin_referer( 'swfte_chat_save' ) ) {
        update_option( 'swfte_agent_id', sanitize_text_field( $_POST['swfte_agent_id'] ?? '' ) );
        update_option( 'swfte_base_url', esc_url_raw(    $_POST['swfte_base_url'] ?? '' ) );
        echo '<div class="updated"><p>Saved.</p></div>';
    }
    $agent_id = esc_attr( get_option( 'swfte_agent_id', '' ) );
    $base_url = esc_attr( get_option( 'swfte_base_url', 'https://api.swfte.com/agents' ) );
    ?>
    <div class="wrap">
      <h1>Swfte Chat</h1>
      <form method="post">
        <?php wp_nonce_field( 'swfte_chat_save' ); ?>
        <table class="form-table">
          <tr>
            <th><label for="swfte_agent_id">Agent ID</label></th>
            <td><input id="swfte_agent_id" name="swfte_agent_id" value="<?php echo $agent_id; ?>" class="regular-text" /></td>
          </tr>
          <tr>
            <th><label for="swfte_base_url">Base URL</label></th>
            <td><input id="swfte_base_url" name="swfte_base_url" value="<?php echo $base_url; ?>" class="regular-text" /></td>
          </tr>
        </table>
        <?php submit_button( 'Save', 'primary', 'swfte_chat_save' ); ?>
      </form>
    </div>
    <?php
}

add_action( 'wp_footer', function () {
    $agent_id = get_option( 'swfte_agent_id', '' );
    $base_url = get_option( 'swfte_base_url', 'https://api.swfte.com/agents' );
    if ( ! $agent_id ) return;
    ?>
    <script src="https://unpkg.com/@swfte/chat-widget@1.1.0/dist/swfte-chat.umd.js"></script>
    <script>
      (function () {
        var client = SwfteChat.createSwfteChatClient({
          baseUrl: <?php echo wp_json_encode( $base_url ); ?>,
          widgetId: <?php echo wp_json_encode( $agent_id ); ?>,
        });
        client.createWidget({ position: 'bottom-right' }).mount(document.body);
      })();
    </script>
    <?php
} );
```

Activate from `wp-admin → Plugins`, then configure the Agent ID under `Settings → Swfte Chat`.

## Identifying logged-in WordPress users

```php
add_action( 'wp_footer', function () {
    if ( ! is_user_logged_in() ) return;
    $u = wp_get_current_user();
    ?>
    <script>
      window.addEventListener('load', function () {
        if (!window.swfteChatClient) return;
        window.swfteChatClient.identify({
          id:    '<?php echo esc_js( $u->ID ); ?>',
          email: '<?php echo esc_js( $u->user_email ); ?>',
          name:  '<?php echo esc_js( $u->display_name ); ?>',
        });
      });
    </script>
    <?php
}, 20);
```

(Adjust your snippet to assign `client` to `window.swfteChatClient` so the identify call can find it.)

## Hiding the widget on specific pages

```php
add_filter( 'swfte_chat_should_render', function ( $render ) {
    if ( is_page( 'checkout' ) ) return false;
    return $render;
} );
```

(Wrap your `wp_footer` script in `if ( apply_filters( 'swfte_chat_should_render', true ) ) { ... }`.)

## CSP / `Content-Security-Policy`

If your site uses CSP, add these directives:

```
script-src  'self' https://unpkg.com;
connect-src 'self' https://api.swfte.com wss://api.swfte.com;
```

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
